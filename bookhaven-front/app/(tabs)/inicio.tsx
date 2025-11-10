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

      {/* Hero Header with Library-inspired Design */}
      <LinearGradient
        colors={theme.gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroHeader, { paddingTop: 20 }]}
      >
        {/* Decorative top border */}
        <View style={styles.decorativeBorder} />

        <View style={styles.heroContent}>
          <View style={styles.headerTop}>
            <View style={styles.greetingSection}>
              <Text style={styles.heroGreeting}>
                {user ? `📚 Bienvenido, ${user.username}` : '📖 Bienvenido a'}
              </Text>
              <Text style={styles.heroTitle}>
                {user ? 'Tu Biblioteca Personal' : 'BookHaven'}
              </Text>
              <Text style={styles.heroSubtitle}>
                {user ? 'Descubre nuevas historias esperándote' : 'Donde cada página es una nueva aventura'}
              </Text>
            </View>
            <View style={styles.logoContainer}>
              <View style={styles.bookIcon}>
                <Ionicons name="library" size={32} color="#FFFFFF" />
              </View>
              <View style={styles.ornament}>
                <Text style={styles.ornamentText}>✦</Text>
              </View>
            </View>
          </View>

          {/* Elegant Search Bar */}
          <View style={styles.searchSection}>
            <Text style={styles.searchLabel}>¿Qué historia buscas hoy?</Text>
            <View style={styles.elegantSearchContainer}>
              <View style={styles.searchBorder}>
                <Ionicons name="search" size={20} color={(theme as any).bookSpine} style={styles.searchIcon} />
                <TextInput
                  style={[styles.elegantSearchInput, { color: theme.text }]}
                  placeholder="Buscar por título, autor o género..."
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
          </View>
        </View>

        {/* Decorative bottom border */}
        <View style={styles.decorativeBottomBorder} />
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
            {/* Community Access Card */}
            <TouchableOpacity
              style={[styles.communityCard, { backgroundColor: (theme as any).bookSpine }]}
              onPress={() => router.push('/comunidad' as any)}
            >
              <LinearGradient
                colors={[(theme as any).bookSpine, (theme as any).goldAccent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.communityGradient}
              >
                <View style={styles.communityContent}>
                  <View style={styles.communityLeft}>
                    <Ionicons name="people" size={28} color="#FFFFFF" />
                    <View style={styles.communityText}>
                      <Text style={styles.communityTitle}>📖 Comunidad Lectora</Text>
                      <Text style={styles.communitySubtitle}>
                        Únete a la conversación literaria
                      </Text>
                    </View>
                  </View>
                  <View style={styles.communityRightIcon}>
                    <Text style={styles.arrowOrnament}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>

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
                <View style={styles.sectionTitleContainer}>
                  <Text style={styles.sectionOrnament}>✦ ❖ ✦</Text>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    {user ? '� Recomendado para Ti' : '🌟 Joyas Literarias'}
                  </Text>
                  <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                    {user
                      ? 'Seleccionados especialmente según tus gustos'
                      : 'Las obras más aclamadas de nuestra biblioteca'
                    }
                  </Text>
                </View>
              </View>

              {loadingRecommendations ? (
                <View style={[styles.loadingContainer, { backgroundColor: (theme as any).pageYellow }]}>
                  <View style={styles.loadingContent}>
                    <Ionicons name="library-outline" size={48} color={theme.tint} />
                    <ActivityIndicator size="large" color={theme.tint} style={styles.spinner} />
                    <Text style={[styles.loadingText, { color: theme.text }]}>
                      Explorando la biblioteca...
                    </Text>
                    <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
                      Seleccionando las mejores recomendaciones
                    </Text>
                  </View>
                </View>
              ) : recommendedBooks.length > 0 ? (
                <SearchResults results={recommendedBooks} onBookPress={handleBookPress} />
              ) : (
                <View style={[styles.emptyState, { backgroundColor: (theme as any).pageYellow }]}>
                  <View style={styles.emptyStateContent}>
                    <Ionicons name="library-outline" size={64} color={theme.tint} />
                    <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                      📖 Tu biblioteca personal te espera
                    </Text>
                    <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                      Explora géneros y autores para descubrir recomendaciones hechas a tu medida
                    </Text>
                    <TouchableOpacity
                      style={[styles.exploreButton, { backgroundColor: theme.tint }]}
                      onPress={() => router.push('/explore' as any)}
                    >
                      <Text style={styles.exploreButtonText}>🔍 Explorar Catálogo</Text>
                    </TouchableOpacity>
                  </View>
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
  // Header Styles - Library Inspired
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 35,
    position: 'relative',
    marginTop: -20, // Conectar con el header superior
  },
  decorativeBorder: {
    position: 'absolute',
    top: -5, // Ajustado para conectar mejor
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  decorativeBottomBorder: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroContent: {
    gap: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greetingSection: {
    flex: 1,
    marginRight: 20,
  },
  heroGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginTop: 4,
    fontStyle: 'italic',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  bookIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  ornament: {
    alignItems: 'center',
  },
  ornamentText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },

  // Search Styles - Elegant Design
  searchSection: {
    gap: 10,
  },
  searchLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  elegantSearchContainer: {
    padding: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchBorder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    paddingHorizontal: 18,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  elegantSearchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  clearIconButton: {
    padding: 4,
  },

  // Content Styles
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 25, // Pequeño espacio arriba
  },

  // Loading Styles - Enhanced
  loadingContainer: {
    paddingVertical: 50,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderRadius: 20,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  loadingContent: {
    alignItems: 'center',
    gap: 15,
  },
  spinner: {
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Results and Home Content
  resultsContainer: {
    flex: 1,
  },
  homeContent: {
    gap: 30,
  },

  // Section Headers - Ornamental
  sectionHeader: {
    marginBottom: 25,
  },
  sectionTitleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  sectionOrnament: {
    fontSize: 16,
    color: '#DAA520',
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Empty State - Enhanced
  emptyState: {
    padding: 40,
    borderRadius: 20,
    margin: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateContent: {
    alignItems: 'center',
    gap: 15,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyStateText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  exploreButton: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    padding: 25,
    borderRadius: 18,
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Recommendations Section
  recommendationsSection: {
    flex: 1,
  },

  // Community Card - Enhanced
  communityCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 69, 19, 0.1)',
  },
  communityGradient: {
    padding: 25,
  },
  communityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  communityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flex: 1,
  },
  communityText: {
    gap: 6,
    flex: 1,
  },
  communityTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  communitySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  communityRightIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowOrnament: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: 'bold',
  },
});
