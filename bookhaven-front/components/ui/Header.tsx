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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
            <Ionicons name="book" size={15} color="#FFFFFF" />
          </View>
          <Text style={styles.logoMainText}>BookHaven</Text>
        </TouchableOpacity>

        {/* Navegación */}
        <View style={styles.navContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/recomendaciones')}
          >
            <Ionicons name="star" size={20} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/chat')}
          >
            <Ionicons name="chatbubbles" size={20} color="rgba(255, 255, 255, 0.9)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/perfil')}
          >
            <Ionicons name="person" size={20} color="rgba(255, 255, 255, 0.9)" />
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
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
    marginBottom: 0, // Asegurar que no haya margen inferior
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoMainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 20,
    height: 20,
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
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});