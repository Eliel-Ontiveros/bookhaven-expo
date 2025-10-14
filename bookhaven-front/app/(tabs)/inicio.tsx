import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
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

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        console.log('🔍 Searching for:', searchQuery);
        const response = await apiService.searchBooks({
          query: searchQuery,
          limit: 20
        });

        if (response.success && response.data) {
          console.log('✅ Search successful:', response.data.length, 'books found');
          setSearchResults(Array.isArray(response.data) ? response.data : []);
        } else {
          console.log('❌ Search failed:', response.error);
          setSearchResults([]);
        }
      } catch (error) {
        console.error('❌ Search error:', error);
        setSearchResults([]);
      }
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleBookPress = (book: Book) => {
    console.log('Book selected:', book);
    // Navigate to book details or handle book selection
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
    <View style={styles.container}>
      {/* Main Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar libros..."
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
    backgroundColor: '#F5F5DC', // Light beige background
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    minHeight: '100%',
  },

  welcomeCard: {
    backgroundColor: '#E6E6FA', // Light lavender
    borderRadius: 20,
    padding: 30,
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
