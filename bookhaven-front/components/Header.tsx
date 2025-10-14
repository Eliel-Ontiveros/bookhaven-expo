import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        {/* Logo pequeño */}
      <View style={styles.logoContainer}>
        <Text style={styles.bookIcon}>📖</Text>
        <Text style={styles.logoText}>BookHaven</Text>
      </View>
      
      {/* Navegación */}
      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/inicio')}
        >
          <Text style={styles.navText}>Inicio</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/recomendaciones')}
        >
          <Text style={styles.navText}>Recomendaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => router.push('/perfil')}
        >
          <Text style={styles.navText}>Perfil</Text>
        </TouchableOpacity>
      </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#4A90E2',
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  navContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  navButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  logoutButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 10,
  },
  logoutText: {
    fontSize: 16,
  },
});