import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import FilterButtons from '@/components/FilterButtons';
import GenreDropdown from '@/components/GenreDropdown';
import AuthorSearch from '@/components/AuthorSearch';
import BooksList from '@/components/BooksList';

export default function RecommendationsScreen() {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [authorQuery, setAuthorQuery] = useState<string>('');
  const [filterBy, setFilterBy] = useState<'author' | 'genre'>('genre');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debounceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    loadInitialBooks();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [selectedGenre, authorQuery]);

  // Función para cargar libros iniciales (recomendaciones del usuario)
  const loadInitialBooks = async () => {
    setLoading(true);
    try {
      console.log('🌟 Loading user recommendations...');
      const response = await apiService.getUserRecommendations();

      if (response.success && response.data && Array.isArray(response.data) && response.data.length > 0) {
        setBooks(response.data);
        setHasMore(false); // Las recomendaciones del usuario son limitadas
      } else {
        // Si no hay recomendaciones personalizadas, cargar libros de ficción por defecto
        await searchBooks('fiction', 1, true);
      }
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      await searchBooks('fiction', 1, true);
    }
    setLoading(false);
  };

  // Función para buscar libros con paginación
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
        response = await apiService.searchBooksByGenre(selectedGenre, page, 20);
      } else if (filterBy === 'author' && authorQuery.trim()) {
        response = await apiService.searchBooksByAuthor(authorQuery.trim(), page, 20);
      } else {
        // Búsqueda por defecto
        response = await apiService.searchBooks({ query, page, limit: 20 });
      }

      if (response.success && response.data && Array.isArray(response.data)) {
        const newBooks = response.data.map((book: any) => ({
          id: book.id || String(Math.random()),
          title: book.title || 'Título no disponible',
          authors: Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Autor desconocido'),
          description: book.description || 'Descripción no disponible',
          categories: Array.isArray(book.categories) ? book.categories : ['General'],
          averageRating: book.averageRating || 0,
          image: book.image || book.coverUrl || undefined,
        }));

        if (reset) {
          setBooks(newBooks);
        } else {
          setBooks(prevBooks => [...prevBooks, ...newBooks]);
        }

        setCurrentPage(page);
        setHasMore(newBooks.length === 20); // Si trae menos de 20, no hay más

        console.log(`✅ Books loaded: ${newBooks.length} (page ${page})`);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('❌ Error searching books:', error);
      setHasMore(false);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  // Función debounced para búsqueda
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

  // Manejar cambios en los filtros
  const handleSearch = () => {
    if (filterBy === 'author' && authorQuery.trim()) {
      debouncedSearch(authorQuery);
    } else if (filterBy === 'genre' && selectedGenre) {
      searchBooks(selectedGenre, 1, true);
    } else if (!selectedGenre && !authorQuery.trim()) {
      // Si no hay filtros activos, mostrar recomendaciones generales
      searchBooks('fiction', 1, true);
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (filter: 'author' | 'genre') => {
    setFilterBy(filter);
    setSelectedGenre('');
    setAuthorQuery('');
    setCurrentPage(1);

    if (filter === 'genre') {
      // Mostrar recomendaciones generales al cambiar a filtro por género
      searchBooks('fiction', 1, true);
    } else {
      // Limpiar resultados al cambiar a filtro por autor
      setBooks([]);
    }
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
  };

  const handleAuthorChange = (author: string) => {
    setAuthorQuery(author);
  };

  const handleBookPress = (book: Book) => {
    console.log('Book selected:', book);
    // Aquí podrías navegar a la pantalla de detalles del libro
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
    console.log('Navigate to:', section);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Recomendaciones</Text>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterBy === 'genre' && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange('genre')}
          >
            <Text style={[
              styles.filterButtonText,
              filterBy === 'genre' && styles.filterButtonTextActive
            ]}>
              Por Género
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterBy === 'author' && styles.filterButtonActive
            ]}
            onPress={() => handleFilterChange('author')}
          >
            <Text style={[
              styles.filterButtonText,
              filterBy === 'author' && styles.filterButtonTextActive
            ]}>
              Por Autor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtros */}
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

        {/* Lista de Libros con Infinite Scroll */}
        <BooksList
          books={books}
          loading={loading}
          onBookPress={handleBookPress}
          onEndReached={handleLoadMore}
          horizontal={false}
        />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CD5C5C', // Coral red
    textAlign: 'center',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#CD5C5C',
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  selectedGenreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#CD5C5C',
    marginBottom: 15,
  },
  scrollIndicator: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  scrollText: {
    fontSize: 20,
    color: '#8B4513',
  },
});