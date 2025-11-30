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
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import { BookCard } from '@/components/books';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const theme = Colors[colorScheme ?? 'light'];
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

  const renderCategory = ({ item }: { item: string }) => {
    const isSelected = selectedCategory === item || (item === 'Todos' && !selectedCategory);
    return (
      <TouchableOpacity
        style={[
          styles.categoryButton,
          {
            backgroundColor: isSelected ? theme.tint : theme.card,
            borderColor: theme.border,
          }
        ]}
        onPress={() => handleCategorySelect(item)}
      >
        <Text
          style={[
            styles.categoryText,
            {
              color: isSelected ? '#FFFFFF' : theme.text,
            }
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[styles.historyItem, { backgroundColor: theme.card }]}
      onPress={() => {
        setSearchQuery(item);
        searchBooks(item, true);
      }}
    >
      <Ionicons name="time-outline" size={16} color={theme.icon} />
      <Text style={[styles.historyText, { color: theme.text }]}>
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
              <Text style={styles.heroTitle}>Explorar</Text>
              <Text style={styles.heroSubtitle}>Descubre nuevos libros</Text>
            </View>
            <View style={styles.logoCircle}>
              <Ionicons name="compass" size={28} color="#FFFFFF" />
            </View>
          </View>

          {/* Modern Search Bar */}
          <View style={styles.modernSearchContainer}>
            <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
            <TextInput
              style={[styles.modernSearchInput, { color: '#000000' }]}
              placeholder="Buscar libros..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIconButton}>
                <Ionicons name="close-circle" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Search History */}
      {searchHistory.length > 0 && searchQuery.length === 0 && (
        <View style={styles.historyContainer}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
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
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
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
              <ActivityIndicator size="large" color={theme.tint} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={theme.icon} />
              <Text style={[styles.emptyText, { color: theme.text }]}>
                No se encontraron libros
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
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
  historyContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  categoriesList: {
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  booksContainer: {
    padding: 20,
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
    fontWeight: 'bold',
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