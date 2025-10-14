import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { apiService } from '@/lib/api/service';
import { User } from '@/lib/api/types';

interface AuthContextType {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      console.log('🔍 Checking token:', token ? 'exists' : 'not found');
      
      if (token) {
        const response = await apiService.getCurrentUser();
        console.log('👤 User check response:', response);
        
        if (response.success && response.data) {
          setUser(response.data);
          console.log('✅ User authenticated:', response.data.username);
        } else {
          console.log('❌ Token invalid, removing...');
          await AsyncStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      await AsyncStorage.removeItem('authToken');
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
        setUser(response.data.user);
        console.log('👤 User logged in:', response.data.user.username);
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
        setUser(response.data.user);
        console.log('👤 User registered:', response.data.user.username);
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
      await AsyncStorage.removeItem('authToken');
      setUser(null);
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