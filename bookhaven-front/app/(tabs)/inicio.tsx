import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import SearchResults from '@/components/SearchResults';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock data for demonstration (will be replaced with API calls)
  const mockBooks: Book[] = [
    {
      id: '1',
      title: 'La metamorfosis',
      authors: 'Franz Kafka',
      description: 'Una de las obras más importantes de la literatura universal...',
      categories: ['Literatura'],
      averageRating: 4.5,
    },
    {
      id: '2',
      title: 'Metamorfosis',
      authors: 'Emanuele Coccia',
      description: 'DE OVIDIO A LA PANDEMIA MUNDIAL. Por fin en castellano, el original e...',
      categories: ['Filosofía'],
      averageRating: 4.0,
    },
    {
      id: '3',
      title: 'Cien años de soledad',
      authors: 'Gabriel García Márquez',
      description: 'Una obra maestra del realismo mágico...',
      categories: ['Literatura'],
      averageRating: 4.8,
    },
  ];

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        const response = await apiService.searchBooks({ query: searchQuery });
        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          // Fallback to mock data if API fails
          const filtered = mockBooks.filter(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.authors.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setSearchResults(filtered);
        }
      } catch (error) {
        console.error('Search failed:', error);
        // Fallback to mock data
        const filtered = mockBooks.filter(book =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.authors.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
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
          /* Welcome Section */
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
            
            <Text style={styles.welcomeTitle}>¡Bienvenido a BookHaven!</Text>
            <Text style={styles.welcomeDescription}>
              Tu espacio para descubrir, organizar y disfrutar de tus libros favoritos. 
              Explora recomendaciones personalizadas, gestiona tus listas de lectura y 
              mantén tu perfil actualizado.
            </Text>
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
    justifyContent: 'center',
  },
});
