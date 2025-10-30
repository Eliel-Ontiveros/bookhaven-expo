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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchResults from '@/components/SearchResults';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Hero Header with Gradient */}
      <LinearGradient
        colors={theme.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.heroContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.heroGreeting}>
                {user ? `Hola, ${user.username}` : 'Bienvenido'}
              </Text>
              <Text style={styles.heroTitle}>Descubre tu próximo libro</Text>
            </View>
            <View style={styles.logoCircle}>
              <Ionicons name="book" size={28} color="#FFFFFF" />
            </View>
          </View>

          {/* Modern Search Bar */}
          <View style={styles.modernSearchContainer}>
            <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
            <TextInput
              style={[styles.modernSearchInput, { color: theme.background }]}
              placeholder="Buscar por título o autor..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearIconButton}>
                <Ionicons name="close-circle" size={20} color={theme.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Buscando libros...
            </Text>
          </View>
        ) : searchResults.length > 0 || (searchQuery.length > 0 && searchResults.length === 0) ? (
          <View style={styles.resultsContainer}>
            {searchResults.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Resultados de búsqueda ({searchResults.length})
                </Text>
                <SearchResults results={searchResults} onBookPress={handleBookPress} />
              </>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                <Ionicons name="search-outline" size={64} color={theme.icon} />
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  No se encontraron resultados
                </Text>
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  Intenta con otros términos de búsqueda
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.homeContent}>
            {/* Stats Cards */}
            {user && (
              <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: theme.card }]}>
                  <Ionicons name="book-outline" size={24} color={theme.tint} />
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {recommendedBooks.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Recomendaciones
                  </Text>
                </View>
              </View>
            )}

            {/* Recommendations Section */}
            <View style={styles.recommendationsSection}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {user ? '🔥 Para ti' : '📚 Popular'}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  {user
                    ? 'Basado en tus preferencias'
                    : 'Los más leídos esta semana'
                  }
                </Text>
              </View>

              {loadingRecommendations ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={theme.tint} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Cargando recomendaciones...
                  </Text>
                </View>
              ) : recommendedBooks.length > 0 ? (
                <SearchResults results={recommendedBooks} onBookPress={handleBookPress} />
              ) : (
                <View style={[styles.emptyState, { backgroundColor: theme.card }]}>
                  <Ionicons name="library-outline" size={64} color={theme.icon} />
                  <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                    No hay recomendaciones
                  </Text>
                  <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                    Explora libros para obtener recomendaciones personalizadas
                  </Text>
                </View>
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
  },
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    gap: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  modernSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  clearIconButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  emptyState: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
  homeContent: {
    gap: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendationsSection: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 20,
  },
});
