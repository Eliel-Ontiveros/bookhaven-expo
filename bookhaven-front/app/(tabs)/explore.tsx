import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import BookCard from '@/components/BookCard';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width: screenWidth } = Dimensions.get('window');

  const categories = [
    'Todos',
    'Ficción',
    'No Ficción',
    'Romance',
    'Misterio',
    'Ciencia Ficción',
    'Fantasía',
    'Biografía',
    'Historia',
    'Ciencia',
    'Tecnología',
    'Arte',
    'Cocina',
    'Autoayuda',
  ];

  useEffect(() => {
    // Cargar búsqueda popular inicial
    loadPopularBooks();
  }, []);

  const loadPopularBooks = async () => {
    setLoading(true);
    try {
      const response = await apiService.searchBooks({
        query: 'bestseller',
        page: 1,
        limit: 20,
      });

      if (response.success && response.data) {
        setBooks(response.data);
      } else {
        console.error('Error loading popular books:', response.error);
      }
    } catch (error) {
      console.error('Error loading popular books:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query: string = searchQuery, resetResults: boolean = true) => {
    if (!query.trim() && !selectedCategory) {
      loadPopularBooks();
      return;
    }

    setLoading(true);

    try {
      let searchParams: any = {
        page: resetResults ? 1 : page,
        limit: 20,
      };

      // Construir query de búsqueda
      if (query.trim() && selectedCategory && selectedCategory !== 'Todos') {
        searchParams.query = `${query} subject:${selectedCategory}`;
      } else if (query.trim()) {
        searchParams.query = query;
      } else if (selectedCategory && selectedCategory !== 'Todos') {
        searchParams.query = `subject:${selectedCategory}`;
      }

      const response = await apiService.searchBooks(searchParams);

      if (response.success && response.data) {
        if (resetResults) {
          setBooks(response.data);
          setPage(2);
          
          // Agregar a historial de búsqueda si hay query
          if (query.trim() && !searchHistory.includes(query.trim())) {
            setSearchHistory(prev => [query.trim(), ...prev.slice(0, 4)]); // Mantener solo 5 elementos
          }
        } else {
          setBooks(prev => [...prev, ...response.data!]);
          setPage(prev => prev + 1);
        }
        
        setHasMore(response.data.length === 20);
      } else {
        Alert.alert('Error', response.error || 'No se pudieron cargar los libros');
        setHasMore(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Error al buscar libros');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchBooks(searchQuery, true);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === 'Todos' ? '' : category);
    searchBooks(searchQuery, true);
  };

  const handleBookPress = (book: Book) => {
    router.push({
      pathname: '/book-detail',
      params: {
        book: JSON.stringify(book),
      },
    });
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      searchBooks(searchQuery, false);
    }
  };

  const renderCategory = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        {
          backgroundColor: (selectedCategory === item || (item === 'Todos' && !selectedCategory))
            ? (isDark ? '#007AFF' : '#007AFF')
            : (isDark ? '#2C2C2E' : '#F2F2F7'),
          borderColor: isDark ? '#38383A' : '#C6C6C8',
        }
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text
        style={[
          styles.categoryText,
          {
            color: (selectedCategory === item || (item === 'Todos' && !selectedCategory))
              ? '#FFFFFF'
              : (isDark ? '#FFFFFF' : '#000000'),
          }
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
      onPress={() => {
        setSearchQuery(item);
        searchBooks(item, true);
      }}
    >
      <Ionicons name="time-outline" size={16} color={isDark ? '#8E8E93' : '#6D6D70'} />
      <Text style={[styles.historyText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderBook = ({ item }: { item: Book }) => (
    <BookCard
      book={item}
      onPress={handleBookPress}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF', paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
        <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Explorar Libros
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7' }]}>
        <View style={[styles.searchBar, { 
          backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
          borderColor: isDark ? '#38383A' : '#C6C6C8'
        }]}>
          <Ionicons name="search" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#000000' }]}
            placeholder="Buscar libros..."
            placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={isDark ? '#8E8E93' : '#6D6D70'} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: isDark ? '#007AFF' : '#007AFF' }]}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search History */}
      {searchHistory.length > 0 && searchQuery.length === 0 && (
        <View style={styles.historyContainer}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
            Búsquedas recientes
          </Text>
          <FlatList
            data={searchHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `history-${index}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.historyList}
          />
        </View>
      )}

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
          Categorías
        </Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Books List */}
      <FlatList
        data={books}
        renderItem={renderBook}
        keyExtractor={(item) => item.id}
        numColumns={screenWidth > 600 ? 3 : 2}
        contentContainerStyle={styles.booksContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={isDark ? '#007AFF' : '#007AFF'} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={isDark ? '#8E8E93' : '#6D6D70'} />
              <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                No se encontraron libros
              </Text>
              <Text style={[styles.emptySubtext, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                Intenta con otros términos de búsqueda
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  historyText: {
    fontSize: 14,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoriesList: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  booksContainer: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});