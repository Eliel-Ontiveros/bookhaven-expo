import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { apiService } from '@/lib/api/service';
import { Book } from '@/lib/api/types';
import FilterButtons from '@/components/FilterButtons';
import GenreSelector from '@/components/GenreSelector';
import BooksList from '@/components/BooksList';

export default function RecommendationsScreen() {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [filterBy, setFilterBy] = useState<'author' | 'genre'>('author');
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      console.log('🌟 Loading recommendations...');
      const response = await apiService.getUserRecommendations();
      console.log('🌟 Recommendations response:', response);
      
      if (response.success && response.data) {
        // Asegurar que data sea un array
        const recommendationsData = Array.isArray(response.data) ? response.data : [];
        console.log('📚 Recommendations loaded:', recommendationsData.length);
        
        // Mapear los datos de la API al formato que espera el frontend
        const formattedRecommendations = recommendationsData.map((book: any) => ({
          id: book.id || book.googleBooksId || String(Math.random()),
          title: book.title || 'Título no disponible',
          authors: Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Autor desconocido'),
          description: book.description || 'Descripción no disponible',
          categories: Array.isArray(book.categories) ? book.categories : (book.categories ? [book.categories] : ['General']),
          averageRating: book.averageRating || 0,
          image: book.image || book.coverUrl || undefined,
        }));
        
        setRecommendations(formattedRecommendations);
        console.log('✅ Formatted recommendations:', formattedRecommendations.length);
      } else {
        console.log('❌ Failed to load recommendations:', response.error);
        // Si no hay recomendaciones de la API, buscar libros populares
        await loadPopularBooks();
      }
    } catch (error) {
      console.error('❌ Error loading recommendations:', error);
      // En caso de error, intentar cargar libros populares
      await loadPopularBooks();
    }
    setLoading(false);
  };

  // Función para cargar libros populares como fallback
  const loadPopularBooks = async () => {
    try {
      console.log('📚 Loading popular books as fallback...');
      
      // Intentar con diferentes queries populares más simples
      const popularQueries = [
        'fiction',
        'novel',
        'bestseller',
        'popular',
        'classic',
        'literature'
      ];
      
      for (const query of popularQueries) {
        console.log(`🔍 Trying query: ${query}`);
        const searchResponse = await apiService.searchBooks({ query });
        
        if (searchResponse.success && searchResponse.data && Array.isArray(searchResponse.data) && searchResponse.data.length > 0) {
          const popularBooks = searchResponse.data.slice(0, 6).map((book: any, index: number) => ({
            id: book.id || String(index),
            title: book.title || 'Título no disponible',
            authors: Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Autor desconocido'),
            description: book.description || 'Descripción no disponible',
            categories: Array.isArray(book.categories) ? book.categories : ['General'],
            averageRating: book.averageRating || 4.0,
            image: book.image || book.coverUrl,
          }));
          
          setRecommendations(popularBooks);
          console.log('✅ Popular books loaded:', popularBooks.length);
          return; // Exit the loop once we find books
        }
      }
      
      // Si ninguna query funcionó, mostrar mensaje vacío
      console.log('❌ No books found with any query');
      setRecommendations([]);
    } catch (error) {
      console.error('❌ Error loading popular books:', error);
      setRecommendations([]);
    }
  };

  const genres = [
    'Ficcion', 'Romance', 'Fantasia', 'Historia', 'Biografia', 'Poesia', 'Comic', 'Novela',
    'Viajes', 'Cocina', 'Salud', 'Negocios', 'Tecnologia', 'Arte', 'Politica', 'Religion'
  ];

  const handleGenreToggle = (genre: string) => {
    let newSelectedGenres;
    if (selectedGenres.includes(genre)) {
      newSelectedGenres = selectedGenres.filter(g => g !== genre);
    } else {
      newSelectedGenres = [...selectedGenres, genre];
    }
    setSelectedGenres(newSelectedGenres);
    
    // Buscar libros por género cuando se selecciona/deselecciona
    if (newSelectedGenres.length > 0) {
      searchBooksByGenres(newSelectedGenres);
    } else {
      loadRecommendations(); // Volver a las recomendaciones originales
    }
  };

  const searchBooksByGenres = async (genres: string[]) => {
    setLoading(true);
    try {
      console.log('🔍 Searching books by genres:', genres);
      
      // Mejorar query de búsqueda para Google Books API
      // Usar términos más generales que Google Books reconoce mejor
      const genreMapping: { [key: string]: string } = {
        'Misterio': 'mystery OR detective OR crime',
        'Romance': 'romance OR love',
        'Fantasia': 'fantasy OR magic',
        'Historia': 'history OR historical',
        'Biografia': 'biography OR memoir',
        'Ficcion': 'fiction OR novel',
        'Poesia': 'poetry',
        'Comic': 'comics OR graphic',
        'Novela': 'novel OR fiction',
        'Viajes': 'travel',
        'Cocina': 'cooking OR cookbook',
        'Salud': 'health OR wellness',
        'Negocios': 'business',
        'Tecnologia': 'technology OR tech',
        'Arte': 'art',
        'Politica': 'politics',
        'Religion': 'religion'
      };
      
      const searchTerms = genres.map(genre => 
        genreMapping[genre] || genre.toLowerCase()
      ).join(' OR ');
      
      console.log('🔍 Search terms:', searchTerms);
      const searchResponse = await apiService.searchBooks({ query: searchTerms });
      
      if (searchResponse.success && searchResponse.data && Array.isArray(searchResponse.data)) {
        const genreBooks = searchResponse.data.slice(0, 10).map((book: any, index: number) => ({
          id: book.id || String(index),
          title: book.title || 'Título no disponible',
          authors: Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Autor desconocido'),
          description: book.description || 'Descripción no disponible',
          categories: Array.isArray(book.categories) ? book.categories : [genres[0]],
          averageRating: book.averageRating || 4.0,
          image: book.image || book.coverUrl,
        }));
        
        setRecommendations(genreBooks);
        console.log('✅ Genre books loaded:', genreBooks.length);
      } else {
        console.log('❌ No books found for selected genres');
      }
    } catch (error) {
      console.error('❌ Error searching books by genres:', error);
    }
    setLoading(false);
  };

  const searchByPopularAuthors = async () => {
    setLoading(true);
    try {
      console.log('👤 Searching books by popular authors...');
      
      // Probar con diferentes autores populares individualmente
      const popularAuthors = ['Stephen King', 'Agatha Christie', 'J.K. Rowling', 'Dan Brown', 'Gabriel García Márquez'];
      
      for (const author of popularAuthors) {
        console.log(`🔍 Searching for author: ${author}`);
        const searchResponse = await apiService.searchBooks({ query: author });
        
        if (searchResponse.success && searchResponse.data && Array.isArray(searchResponse.data) && searchResponse.data.length > 0) {
          const authorBooks = searchResponse.data.slice(0, 8).map((book: any, index: number) => ({
            id: book.id || String(index),
            title: book.title || 'Título no disponible',
            authors: Array.isArray(book.authors) ? book.authors.join(', ') : (book.authors || 'Autor desconocido'),
            description: book.description || 'Descripción no disponible',
            categories: Array.isArray(book.categories) ? book.categories : ['General'],
            averageRating: book.averageRating || 4.0,
            image: book.image || book.coverUrl,
          }));
          
          setRecommendations(authorBooks);
          console.log('✅ Author books loaded:', authorBooks.length);
          return; // Exit once we find books
        }
      }
      
      // Si no se encontraron libros con ningún autor, usar fallback
      console.log('❌ No books found for popular authors, using fallback');
      await loadPopularBooks();
    } catch (error) {
      console.error('❌ Error searching books by authors:', error);
      loadRecommendations(); // Fallback a recomendaciones originales
    }
    setLoading(false);
  };

  const handleNavigation = (section: string) => {
    console.log('Navigate to:', section);
  };

  const handleBookPress = (book: Book) => {
    console.log('Book selected:', book);
  };

  const handleFilterChange = (filter: 'author' | 'genre') => {
    if (filter === 'author') {
      setFilterBy('author');
      setSelectedGenres([]);
      searchByPopularAuthors();
    } else {
      setFilterBy('genre');
      setSelectedGenres([]);
    }
  };

  const filteredBooks = (recommendations || []).filter(book => 
    selectedGenres.length === 0 || (book.categories && book.categories.some(category => selectedGenres.includes(category)))
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Recomendaciones</Text>

        {/* Filter Buttons */}
        <FilterButtons 
          filterBy={filterBy}
          onFilterChange={handleFilterChange}
        />

        {/* Genre Selection */}
        <GenreSelector
          genres={genres}
          selectedGenres={selectedGenres}
          onGenreToggle={handleGenreToggle}
          visible={filterBy === 'genre'}
        />

        {/* Selected Genre Title */}
        {selectedGenres.length > 0 && (
          <Text style={styles.selectedGenreTitle}>
            {selectedGenres.join(', ')}
          </Text>
        )}

        {/* Books List */}
        <BooksList
          books={filteredBooks}
          loading={loading}
          onBookPress={handleBookPress}
        />

        {/* Scroll Indicator */}
        <View style={styles.scrollIndicator}>
          <Text style={styles.scrollText}>⬇</Text>
        </View>
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#CD5C5C', // Coral red
    textAlign: 'center',
    marginBottom: 20,
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