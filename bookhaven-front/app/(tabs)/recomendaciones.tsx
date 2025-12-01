import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import { FilterButtons, GenreDropdown, AuthorSearch, SearchResults } from '@/components/search';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function RecommendationsScreen() {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [authorQuery, setAuthorQuery] = useState<string>('');
  const [filterBy, setFilterBy] = useState<'author' | 'genre'>('genre');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  useEffect(() => {
    loadInitialBooks();
  }, []);

  useEffect(() => {
    if (filterBy === 'author') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    } else {
      handleSearch();
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [selectedGenre, authorQuery, filterBy]);

  // Función para cargar libros iniciales (recomendaciones del usuario)
  const loadInitialBooks = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUserRecommendations();

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setBooks(response.data);
        setHasMore(false);
      } else {
        await searchBooks('fiction', 1, true);
      }
    } catch (error) {
      console.error('❌ Error cargando recomendaciones:', error);
      await searchBooks('fiction', 1, true);
    }
    setLoading(false);
  };

  const searchBooks = async (
    query: string,
    page: number = 1,
    reset: boolean = false
  ) => {
    if (reset) {
      setLoading(true);
      setBooks([]);
      setCurrentPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      let response;

      if (filterBy === 'genre' && selectedGenre) {
        response = await apiService.searchBooksByGenre(selectedGenre, page, 10);
      } else if (filterBy === 'author' && authorQuery.trim()) {
        if (authorQuery.trim().length < 2) {
          response = await apiService.searchBooks({ query: 'bestseller', page, limit: 10 });
        } else {
          response = await apiService.searchBooksByAuthor(authorQuery.trim(), page, 10);

          if (response.success && page === 1) {
            let booksData: any[] = [];

            if (Array.isArray(response.data)) {
              booksData = response.data;
            } else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
              booksData = Array.isArray((response.data as any).data) ? (response.data as any).data : [];
            }

            if (booksData.length === 0) {
              const fallbackQuery = authorQuery.split(' ')[0];
              response = await apiService.searchBooks({
                query: `inauthor:${fallbackQuery}`,
                page,
                limit: 10
              });
            }
          }
        }
      } else {
        response = await apiService.searchBooks({ query, page, limit: 10 });
      }

      let booksData: any[] = [];
      if (response.success && response.data) {
        if (typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
          booksData = response.data.data;
        } else if (Array.isArray(response.data)) {
          booksData = response.data;
        }
      }

      if (booksData.length > 0) {
        const newBooks = booksData.map((book: any, index: number) => {
          if (!book || typeof book !== 'object') {
            return null;
          }

          const processedBook = {
            id: book.id ? String(book.id) : `temp_${Date.now()}_${index}`,
            title: book.title && typeof book.title === 'string' ? book.title : 'Título no disponible',
            authors: book.authors ? (Array.isArray(book.authors) ? book.authors.join(', ') : String(book.authors)) : 'Autor desconocido',
            description: book.description && typeof book.description === 'string' ? book.description : 'Descripción no disponible',
            categories: Array.isArray(book.categories) ? book.categories : (book.categories ? [String(book.categories)] : ['General']),
            averageRating: book.averageRating && typeof book.averageRating === 'number' ? book.averageRating : 0,
            image: book.image && typeof book.image === 'string' ? book.image : (book.coverUrl && typeof book.coverUrl === 'string' ? book.coverUrl : undefined),
          };

          return processedBook;
        }).filter(book => book !== null);

        if (reset) {
          setBooks(newBooks);
        } else {
          setBooks(prevBooks => [...prevBooks, ...newBooks]);
        }

        setCurrentPage(page);
        setHasMore(newBooks.length === 10);
      } else {
        if (reset) {
          setBooks([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Error searching books:', error);
      setHasMore(false);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (query.trim() || selectedGenre) {
        searchBooks(query.trim() || selectedGenre, 1, true);
      }
    }, 500);
  }, [selectedGenre]);

  const handleSearch = () => {
    if (filterBy === 'author') {
      if (authorQuery.trim().length >= 2) {
        searchBooks(authorQuery, 1, true);
      } else if (authorQuery.trim().length === 0) {
        loadInitialBooks();
      }
    } else if (filterBy === 'genre' && selectedGenre) {
      searchBooks(selectedGenre, 1, true);
    } else {
      loadInitialBooks();
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (filter: 'author' | 'genre') => {
    setFilterBy(filter);
    setSelectedGenre('');
    setAuthorQuery('');
    setCurrentPage(1);
    setBooks([]);
    setHasMore(true);

    if (filter === 'genre') {
      loadInitialBooks();
    }
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleAuthorChange = (author: string) => {
    setAuthorQuery(author);
    setCurrentPage(1);
    setHasMore(true);
  };

  const handleBookPress = (book: Book) => {
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

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;

      if (filterBy === 'genre' && selectedGenre) {
        searchBooks(selectedGenre, nextPage, false);
      } else if (filterBy === 'author' && authorQuery.trim()) {
        searchBooks(authorQuery.trim(), nextPage, false);
      }
    }
  };

  const handleNavigation = (section: string) => {
  };

  const handleScroll = (event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    const HEADER_HEIGHT = 200; // Altura aproximada del header
    const SCROLL_THRESHOLD = 50; // Umbral para activar la animación

    setShowScrollToTop(scrollY > 300);

    // Detectar cuando se está cerca del final para scroll infinito
    const isNearEnd = scrollY + scrollViewHeight >= contentHeight - 100; // 100px antes del final

    if (isNearEnd && !loadingMore && hasMore && books.length > 0) {
      handleLoadMore();
    }

    // Animar header con animaciones más rápidas
    if (scrollY > SCROLL_THRESHOLD) {
      // Ocultar header principal
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: -HEADER_HEIGHT,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Mostrar header principal
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Hero Header with Gradient - Animado */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <LinearGradient
          colors={theme.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}
        >
          <View style={styles.heroContent}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.heroTitle}>Recomendaciones</Text>
                <Text style={styles.heroSubtitle}>Encuentra libros para ti</Text>
              </View>
              <View style={styles.logoCircle}>
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
              </View>
            </View>

            {/* Filter Buttons */}
            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterBy === 'genre' && [styles.filterButtonActive, { backgroundColor: theme.accent }]
                ]}
                onPress={() => handleFilterChange('genre')}
              >
                <Ionicons
                  name="albums-outline"
                  size={20}
                  color={filterBy === 'genre' ? '#FFFFFF' : theme.textMuted}
                />
                <Text style={[
                  styles.filterButtonText,
                  { color: filterBy === 'genre' ? '#FFFFFF' : theme.text }
                ]}>
                  Por Género
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filterBy === 'author' && [styles.filterButtonActive, { backgroundColor: theme.accent }]
                ]}
                onPress={() => handleFilterChange('author')}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={filterBy === 'author' ? '#FFFFFF' : theme.textMuted}
                />
                <Text style={[
                  styles.filterButtonText,
                  { color: filterBy === 'author' ? '#FFFFFF' : theme.text }
                ]}>
                  Por Autor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Contenido principal con ScrollView */}
      <View style={styles.mainContent}>
        {/* Filtros fijos - Solo visibles cuando header se oculta */}
        <Animated.View
          style={[
            styles.stickyFiltersContainer,
            {
              opacity: headerOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
              backgroundColor: theme.background,
              paddingTop: insets.top,
            },
          ]}
        >
          <View style={styles.stickyFiltersContent}>
            {filterBy === 'genre' && (
              <GenreDropdown
                selectedGenre={selectedGenre}
                onGenreChange={handleGenreChange}
                visible={true}
              />
            )}

            {filterBy === 'author' && (
              <AuthorSearch
                authorQuery={authorQuery}
                onAuthorChange={handleAuthorChange}
                visible={true}
              />
            )}
          </View>
        </Animated.View>

        {/* ScrollView principal */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Spacer para el header */}
          <View style={styles.headerSpacer} />

          {/* Filtros normales - Visibles cuando header es visible */}
          <Animated.View
            style={[
              styles.normalFiltersContainer,
              {
                opacity: headerOpacity,
              },
            ]}
          >
            {filterBy === 'genre' && (
              <GenreDropdown
                selectedGenre={selectedGenre}
                onGenreChange={handleGenreChange}
                visible={true}
              />
            )}

            {filterBy === 'author' && (
              <AuthorSearch
                authorQuery={authorQuery}
                onAuthorChange={handleAuthorChange}
                visible={true}
              />
            )}
          </Animated.View>

          {/* Lista de Libros */}
          <View style={styles.booksContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>🔍 Buscando recomendaciones...</Text>
              </View>
            ) : books.length > 0 ? (
              <SearchResults
                results={books}
                onBookPress={handleBookPress}
                loading={loading}
                loadingMore={loadingMore}
                nestedInScrollView
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>
                  {filterBy === 'author' && authorQuery.trim().length >= 2
                    ? '🔍'
                    : filterBy === 'genre' && selectedGenre
                      ? '📖'
                      : '📚'
                  }
                </Text>
                <Text style={styles.emptyText}>
                  {filterBy === 'author' && authorQuery.trim().length >= 2
                    ? `👤 No se encontraron libros de "${authorQuery}"`
                    : filterBy === 'genre' && selectedGenre
                      ? `📚 No se encontraron libros de ${selectedGenre}`
                      : '📚 No se encontraron recomendaciones'
                  }
                </Text>
                <Text style={styles.emptySubtext}>
                  {filterBy === 'author' && authorQuery.trim().length >= 2
                    ? 'Intenta con otro autor o verifica la ortografía'
                    : filterBy === 'genre' && selectedGenre
                      ? 'Intenta con otro género'
                      : 'Selecciona un género o busca por autor'
                  }
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Botón flotante para regresar arriba */}
      {showScrollToTop && (
        <TouchableOpacity
          style={[styles.scrollToTopButton, { backgroundColor: theme.accent }]}
          onPress={scrollToTop}
        >
          <Ionicons name="chevron-up" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  mainContent: {
    flex: 1,
  },
  stickyFiltersContainer: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  stickyFiltersContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
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
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  filterButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerSpacer: {
    height: 250, // Altura para compensar el header fijo
  },
  normalFiltersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerAndFiltersSpacer: {
    height: 350, // Altura para compensar header + filtros cuando están en posición normal
  },
  stickyFiltersSpacer: {
    height: 100, // Altura para compensar los filtros siempre visibles
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  booksContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  scrollToTopButton: {
    position: 'absolute' as const,
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});