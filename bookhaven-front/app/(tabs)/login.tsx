import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      console.log('🔐 Login attempt from UI:', email);
      await login(email, password);
      console.log('✅ Login completed successfully');
      
      // Redirigir explícitamente a la pantalla de inicio
      console.log('🚀 Redirecting to inicio...');
      router.replace('/inicio');
    } catch (error) {
      console.error('❌ Login failed in UI:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleRegister = () => {
    router.push('/registro');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.loginCard}>
          {/* Logo and Book Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.bookIcon}>
              <Text style={styles.bookText}>📖</Text>
            </View>
            <Text style={styles.brandText}>
              <Text style={styles.bookText}>BOOK</Text>
              {'\n'}
              <Text style={styles.havenText}>HAVEN</Text>
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Iniciar Sesión</Text>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#B8860B"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#B8860B"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC', // Light beige background
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D2691E',
    padding: 30,
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
  },
  bookIcon: {
    marginRight: 10,
  },
  bookText: {
    fontSize: 24,
  },
  brandText: {
    textAlign: 'center',
  },
  havenText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFFACD', // Light yellow background
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#8B4513',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#CD5C5C', // Coral red color
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerText: {
    color: '#8B4513',
    fontSize: 14,
  },
  registerLink: {
    color: '#CD5C5C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});