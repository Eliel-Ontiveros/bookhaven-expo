import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function Header() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const pathname = usePathname();

  const getNavButtonStyle = (route: string) => {
    const isActive = pathname === route;
    return [
      styles.navButton,
      isActive && styles.navButtonActive,
      { backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent' }
    ];
  };

  const getNavTextStyle = (route: string) => {
    const isActive = pathname === route;
    return [
      styles.navText,
      isActive && styles.navTextActive,
      { color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.8)' }
    ];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={theme.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        {/* Logo Principal Izquierda */}
        <TouchableOpacity
          style={styles.logoMainContainer}
          onPress={() => router.push('/inicio')}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="book" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.logoMainText}>BookHaven</Text>
        </TouchableOpacity>

        {/* Navegación */}
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={getNavButtonStyle('/recomendaciones')}
            onPress={() => router.push('/recomendaciones')}
          >
            <Ionicons name="star" size={18} color="rgba(255, 255, 255, 0.9)" />
            <Text style={getNavTextStyle('/recomendaciones')}>Recomendaciones</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={getNavButtonStyle('/perfil')}
            onPress={() => router.push('/perfil')}
          >
            <Ionicons name="person" size={18} color="rgba(255, 255, 255, 0.9)" />
            <Text style={getNavTextStyle('/perfil')}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 60,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  logoMainText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    gap: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  navButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  navTextActive: {
    fontWeight: 'bold',
  },
});