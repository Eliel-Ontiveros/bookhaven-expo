import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Función para determinar la URL base del API
const getBaseUrl = (): string => {
  // Primero intentar usar la variable de entorno
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) {
    console.log('🔧 Using API URL from .env:', envUrl);
    return envUrl;
  }

  // Detectar automáticamente según el entorno y plataforma
  if (__DEV__) {
    // En desarrollo, detectar la mejor URL según la plataforma
    if (Platform.OS === 'web') {
      return 'http://localhost:3000';
    } else if (Platform.OS === 'android') {
      // Para emulador Android, usar 10.0.2.2
      // Para dispositivo físico, usar la IP de la red
      return 'http://10.0.2.2:3000';
    } else if (Platform.OS === 'ios') {
      // Para iOS usar localhost en simulador, IP de red en dispositivo físico
      return 'http://localhost:3000';
    }

    // Por defecto, usar localhost
    return 'http://localhost:3000';
  }

  // En producción, usar la URL configurada o por defecto
  return 'https://your-production-api.com';
};

// API configuration
export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000'),
  DEBUG: process.env.EXPO_PUBLIC_API_DEBUG === 'true',
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',

    // Books
    BOOKS_SEARCH: '/api/books/search',
    BOOK_DETAIL: '/api/books',

    // Book Lists
    BOOKLISTS: '/api/booklists',

    // Comments
    COMMENTS: '/api/comments',

    // Ratings
    RATINGS: '/api/ratings',

    // Chatbot
    CHATBOT: '/api/chatbot',

    // User/Profile
    USER_PROFILE: '/api/users/profile',
    USER_RECOMMENDATIONS: '/api/users/recommendations',
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}