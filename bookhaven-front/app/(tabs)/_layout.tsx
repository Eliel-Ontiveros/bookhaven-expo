import { Tabs } from 'expo-router';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
      </View>
    );
  }

  // Si no hay usuario autenticado, mostrar solo login y registro SIN tab bar
  if (!user) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { display: 'none' }, // Ocultar tab bar en login/registro
        }}>
        <Tabs.Screen
          name="login"
          options={{
            title: 'Login',
          }}
        />
        <Tabs.Screen
          name="registro"
          options={{
            title: 'Registro',
          }}
        />
        {/* Ocultar las otras pestañas */}
        <Tabs.Screen
          name="inicio"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="recomendaciones"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="comunidad"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  // Si hay usuario autenticado, mostrar Header pequeño y ocultar tab bar
  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <Header />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: { display: 'none' }, // Ocultar tab bar
        }}>
        <Tabs.Screen
          name="inicio"
          options={{
            title: 'Inicio',
          }}
        />
        <Tabs.Screen
          name="recomendaciones"
          options={{
            title: 'Recomendaciones',
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
          }}
        />
        {/* Ocultar otras pestañas */}
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="registro"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
