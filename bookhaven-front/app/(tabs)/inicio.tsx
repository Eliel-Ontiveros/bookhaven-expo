import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchResults from '@/components/SearchResults';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const { user } = useAuth();

  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Cargar recomendaciones al inicializar la pantalla
  useEffect(() => {
    if (user) {
      loadRecommendations();
    } else {
      loadPopularBooks();
    }
  }, [user]);

  // Función para cargar recomendaciones del usuario autenticado
  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      console.log('🌟 Loading user recommendations...');
      const response = await apiService.getUserRecommendations();
      console.log('🌟 Recommendations response:', response);

      if (response.success && response.data) {
        const recommendationsData = Array.isArray(response.data) ? response.data : [];
        setRecommendedBooks(recommendationsData);
        console.log('✅ Recommendations loaded:', recommendationsData.length);
      } else {
        console.log('❌ Failed to load recommendations, loading popular books');
        await loadPopularBooks();
      }
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      await loadPopularBooks();
    }
    setLoadingRecommendations(false);
  };

  // Función para cargar libros populares como fallback
  const loadPopularBooks = async () => {
    setLoadingRecommendations(true);
    try {
      console.log('📚 Loading popular books...');

      const popularQueries = ['bestseller', 'fiction', 'novel'];

      for (const query of popularQueries) {
        const response = await apiService.searchBooks({ query, limit: 20 });
        if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
          setRecommendedBooks(response.data.slice(0, 20));
          console.log('✅ Popular books loaded:', response.data.length);
          break;
        }
      }
    } catch (error) {
      console.error('❌ Error loading popular books:', error);
      setRecommendedBooks([]);
    }
    setLoadingRecommendations(false);
  };

  // Búsqueda debounced para mejor UX
  const debouncedSearch = useCallback((query: string) => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      } else if (query.trim().length === 0) {
        setSearchResults([]);
        setIsSearching(false);
      }
    }, 500); // Esperar 500ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId);
  }, []);

  // Función separada para realizar la búsqueda
  const performSearch = async (query: string) => {
    setIsSearching(true);
    try {
      console.log('🔍 Searching for:', query);

      // Mejorar la búsqueda para hacerla más flexible
      const enhancedQuery = enhanceSearchQuery(query.trim());
      console.log('🔧 Enhanced query:', enhancedQuery);

      const response = await apiService.searchBooks({
        query: enhancedQuery,
        limit: 20
      });

      if (response.success && response.data) {
        // Manejar estructura de respuesta con paginación
        let books: any[] = [];

        if (Array.isArray(response.data)) {
          // Respuesta directa
          books = response.data;
        } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          // Respuesta con paginación
          books = Array.isArray((response.data as any).data) ? (response.data as any).data : [];
        }

        console.log('✅ Search successful:', books.length, 'books found');
        setSearchResults(books);
      } else {
        console.log('❌ Search failed:', response.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await performSearch(searchQuery);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    const cleanup = debouncedSearch(searchQuery);
    return cleanup;
  }, [searchQuery, debouncedSearch]);

  // Función para mejorar las búsquedas de título
  const enhanceSearchQuery = (query: string): string => {
    // Limpiar la query
    const cleanQuery = query.toLowerCase().trim();

    // Si la búsqueda contiene múltiples palabras, buscar por título con flexibilidad
    const words = cleanQuery.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 1) {
      // Para una sola palabra, buscar en título o autor
      return `intitle:"${words[0]}" OR inauthor:"${words[0]}" OR "${words[0]}"`;
    } else if (words.length <= 3) {
      // Para 2-3 palabras, priorizar búsqueda de título completo pero también palabras individuales
      const fullPhrase = words.join(' ');
      const individualWords = words.map(word => `intitle:"${word}"`).join(' OR ');
      return `intitle:"${fullPhrase}" OR (${individualWords})`;
    } else {
      // Para más de 3 palabras, buscar la frase completa y las primeras 3 palabras
      const fullPhrase = words.join(' ');
      const firstThreeWords = words.slice(0, 3).join(' ');
      return `intitle:"${fullPhrase}" OR intitle:"${firstThreeWords}"`;
    }
  };

  const handleBookPress = (book: Book) => {
    console.log('📖 Navigating to book details:', book.title);
    router.push({
      pathname: '/book-detail',
      params: {
        book: JSON.stringify({
          id: book.id,
          title: book.title,
          authors: book.authors,
          description: book.description,
          image: book.image,
          categories: book.categories,
          averageRating: book.averageRating
        })
      }
    });
  };

  const handleNavigation = (section: string) => {
    console.log('Navigate to:', section);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: screenWidth * 0.05 }]}
      >
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={[styles.searchContainer, {
            maxWidth: screenWidth > 600 ? screenWidth * 0.8 : '100%',
            alignSelf: 'center'
          }]}>
            <TextInput
              style={[styles.searchInput, { fontSize: screenWidth > 600 ? 18 : 16 }]}
              placeholder="Buscar por título o autor... (escribe al menos 2 caracteres)"
              placeholderTextColor="#8B4513"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Content based on search state */}
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Buscando...</Text>
          </View>
        ) : searchResults.length > 0 || (searchQuery.length > 0 && searchResults.length === 0) ? (
          <View style={styles.resultsContainer}>
            <SearchResults results={searchResults} onBookPress={handleBookPress} />
          </View>
        ) : (
          /* Welcome Section with Recommendations */
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeCard}>
              <View style={styles.bookIconLarge}>
                <Text style={styles.bookIconLargeText}>📖</Text>
              </View>
              <Text style={styles.brandTitle}>
                <Text style={styles.bookTitle}>BOOK</Text>
                {'\n'}
                <Text style={styles.havenTitle}>HAVEN</Text>
              </Text>
            </View>

            <Text style={styles.welcomeTitle}>
              {user ? `¡Hola, ${user.username}!` : '¡Bienvenido a BookHaven!'}
            </Text>
            <Text style={styles.welcomeDescription}>
              {user
                ? 'Aquí tienes algunas recomendaciones personalizadas para ti.'
                : 'Descubre libros populares y crea tu cuenta para recomendaciones personalizadas.'
              }
            </Text>

            {/* Recommendations Section */}
            <View style={styles.recommendationsSection}>
              <Text style={styles.recommendationsTitle}>
                {user ? 'Recomendado para ti' : 'Libros populares'}
              </Text>

              {loadingRecommendations ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#4682B4" />
                  <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
                </View>
              ) : recommendedBooks.length > 0 ? (
                <SearchResults results={recommendedBooks} onBookPress={handleBookPress} />
              ) : (
                <Text style={styles.noRecommendationsText}>
                  No hay recomendaciones disponibles en este momento.
                </Text>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
    minHeight: '100%',
  },
  welcomeCard: {
    backgroundColor: '#E6E6FA',
    borderRadius: 20,
    padding: Dimensions.get('window').width > 600 ? 40 : 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  bookIconLarge: {
    marginBottom: 15,
  },
  bookIconLargeText: {
    fontSize: 60,
  },
  brandTitle: {
    textAlign: 'center',
  },
  bookTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    lineHeight: 36,
  },
  havenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    lineHeight: 28,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 15,
  },
  welcomeDescription: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 350,
  },
  searchSection: {
    width: '100%',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#FFFACD', // Light yellow background
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 100, // Space for buttons
    fontSize: 16,
    color: '#8B4513',
    borderWidth: 1,
    borderColor: '#DDD',
  },
  searchButton: {
    position: 'absolute',
    right: 40,
    height: 40,
    width: 40,
    backgroundColor: '#CD5C5C',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 18,
  },
  clearButton: {
    position: 'absolute',
    right: 5,
    height: 30,
    width: 30,
    backgroundColor: '#8B4513',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  resultsContainer: {
    flex: 1,
    width: '100%',
  },
  welcomeSection: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  recommendationsSection: {
    width: '100%',
    marginTop: 30,
  },
  recommendationsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4682B4',
    marginBottom: 15,
    textAlign: 'center',
  },
  noRecommendationsText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
});
