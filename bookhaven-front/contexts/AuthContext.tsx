import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiService } from '@/lib/api/service';
import { User } from '@/lib/api/types';
import { NotificationService } from '@/lib/notifications';
import NotificationAPIService from '@/lib/api/notifications';
import * as Notifications from 'expo-notifications';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  birthdate: string;
  favoriteGenres: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Export the context for potential direct usage
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    // Setup notification listeners with navigation handlers
    const cleanup = NotificationService.setupNotificationListeners(
      // Cuando se recibe una notificación (app en foreground)
      (notification) => {
        console.log('📬 Notification received in foreground:', notification);
      },
      // Cuando el usuario toca una notificación
      (response) => {
        console.log('👆 Notification tapped:', response);
        handleNotificationResponse(response);
      }
    );

    return cleanup;
  }, []);

  // Manejar navegación cuando se toca una notificación
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;

    if (!data) return;

    console.log('🔔 Handling notification data:', data);

    // Navegar según el tipo de notificación
    if (data.type === 'chat_message' && data.conversationId) {
      // Navegar al chat
      router.push({
        pathname: '/chat/[conversationId]',
        params: {
          conversationId: data.conversationId as string,
          conversationName: (data.senderName as string) || 'Chat'
        }
      });
    } else if (data.type === 'post_comment' && data.postId) {
      // Navegar al post
      router.push({
        pathname: '/post-detail',
        params: {
          postId: data.postId as string
        }
      });
    }
  };

  const checkAuthStatus = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('authToken');
      console.log('🔍 Checking token:', savedToken ? 'exists' : 'not found');

      if (savedToken) {
        setToken(savedToken);
        const response = await apiService.getCurrentUser();
        console.log('👤 User check response:', response);

        if (response.success && response.data) {
          setUser(response.data);
          console.log('✅ User authenticated:', response.data.username);

          // Register for push notifications
          try {
            const pushToken = await NotificationService.registerForPushNotificationsAsync();
            if (pushToken) {
              await NotificationAPIService.registerPushToken(pushToken);
              console.log('🔔 Push token registered successfully');
            }
          } catch (notifError) {
            console.error('⚠️ Failed to register push notifications:', notifError);
            // Don't fail auth if notifications fail
          }
        } else {
          console.log('❌ Token invalid, removing...');
          await AsyncStorage.removeItem('authToken');
          setToken(null);
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      await AsyncStorage.removeItem('authToken');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);

      const response = await apiService.login({ email, password });
      console.log('🔐 Login response:', response);

      if (response.success && response.data) {
        console.log('✅ Login successful, saving token...');
        console.log('🔑 Token received:', response.data.token ? 'YES' : 'NO');
        console.log('👤 User data:', response.data.user);

        if (!response.data.token) {
          throw new Error('No se recibió el token de autenticación');
        }

        await AsyncStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        console.log('👤 User logged in:', response.data.user.username);

        // Register for push notifications
        try {
          const pushToken = await NotificationService.registerForPushNotificationsAsync();
          if (pushToken) {
            await NotificationAPIService.registerPushToken(pushToken);
            console.log('🔔 Push token registered successfully');
          }
        } catch (notifError) {
          console.error('⚠️ Failed to register push notifications:', notifError);
          // Don't fail login if notifications fail
        }
      } else {
        throw new Error(response.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    try {
      console.log('📝 Attempting registration for:', userData.email);

      const response = await apiService.register(userData);
      console.log('📝 Register response:', response);

      if (response.success && response.data) {
        console.log('✅ Registration successful, saving token...');
        console.log('🔑 Token received:', response.data.token ? 'YES' : 'NO');
        console.log('👤 User data:', response.data.user);

        if (!response.data.token) {
          throw new Error('No se recibió el token de autenticación');
        }

        await AsyncStorage.setItem('authToken', response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);
        console.log('👤 User registered:', response.data.user.username);

        // Register for push notifications
        try {
          const pushToken = await NotificationService.registerForPushNotificationsAsync();
          if (pushToken) {
            await NotificationAPIService.registerPushToken(pushToken);
            console.log('🔔 Push token registered successfully');
          }
        } catch (notifError) {
          console.error('⚠️ Failed to register push notifications:', notifError);
          // Don't fail registration if notifications fail
        }
      } else {
        throw new Error(response.error || 'Error al registrar usuario');
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Logging out user...');

      // Unregister push token
      try {
        await NotificationAPIService.unregisterPushToken();
        console.log('🔔 Push token unregistered successfully');
      } catch (notifError) {
        console.error('⚠️ Failed to unregister push notifications:', notifError);
        // Continue with logout even if unregister fails
      }

      await AsyncStorage.removeItem('authToken');
      setUser(null);
      setToken(null);
      console.log('✅ Logout successful');

      // Redirigir al login después del logout
      console.log('🚀 Redirecting to login...');
      router.replace('/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    loading: isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};