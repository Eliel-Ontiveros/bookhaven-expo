import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddToListModal from '@/components/AddToListModal';
import CommentsModal from '@/components/CommentsModal';
import StarRating from '@/components/StarRating';
import { Book } from '@/lib/api/types';

interface BookDetailProps {
  route?: {
    params?: {
      book?: {
        id: string;
        title: string;
        author: string;
        description: string;
        coverUrl?: string;
        genre?: string;
        rating?: number;
        totalRatings?: number;
      };
    };
  };
}

export default function BookDetailScreen() {
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  // Parse book data from params
  let book;
  try {
    book = params.book ? JSON.parse(params.book as string) : null;
  } catch (error) {
    console.error('Error parsing book data:', error);
    book = null;
  }

  // Fallback to default data if no book provided
  if (!book) {
    book = {
      id: '1',
      title: 'Libro no encontrado',
      authors: 'Autor desconocido',
      description: 'No hay descripción disponible.',
      categories: ['General'],
      averageRating: 0,
      image: undefined,
    };
  }

  const handleGoBack = () => {
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header with back button integrated in content */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color="#4682B4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalles del Libro</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Book Title */}
        <Text style={styles.title}>{book.title}</Text>

        <View style={[styles.bookContainer, { flexDirection: screenWidth > 600 ? 'row' : 'column' }]}>
          {/* Book Cover */}
          <View style={[styles.bookCover, {
            width: screenWidth > 600 ? screenWidth * 0.25 : screenWidth * 0.4,
            height: screenWidth > 600 ? screenWidth * 0.35 : screenWidth * 0.6,
            alignSelf: screenWidth > 600 ? 'flex-start' : 'center'
          }]}>
            {book.image ? (
              <Image source={{ uri: book.image }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderCover}>
                <Text style={styles.placeholderText}>📖</Text>
                <Text style={styles.placeholderTitle}>{book.title}</Text>
              </View>
            )}
          </View>

          {/* Book Info */}
          <View style={[styles.bookInfo, {
            flex: screenWidth > 600 ? 1 : undefined,
            paddingLeft: screenWidth > 600 ? 20 : 0,
            paddingTop: screenWidth > 600 ? 0 : 20
          }]}>
            <Text style={styles.infoLabel}>Autores:</Text>
            <Text style={styles.authorText}>{book.authors}</Text>

            <Text style={styles.infoLabel}>Géneros:</Text>
            <Text style={styles.genreText}>
              {Array.isArray(book.categories) && book.categories.length > 0
                ? book.categories.join(', ')
                : 'Género no especificado'}
            </Text>

            <Text style={styles.infoLabel}>Calificación:</Text>
            <StarRating
              bookId={book.id}
              size="medium"
              onRatingChange={(rating) => {
                console.log('User rated book:', rating);
              }}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Sinopsis:</Text>
          <Text style={styles.descriptionText}>
            {book.description || 'No hay descripción disponible para este libro.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { width: screenWidth > 600 ? screenWidth * 0.4 : '100%' }]}
            onPress={() => setShowAddToListModal(true)}
          >
            <Text style={styles.buttonText}>📚 Agregar a Lista</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { width: screenWidth > 600 ? screenWidth * 0.4 : '100%' }]}
            onPress={() => setShowCommentsModal(true)}
          >
            <Text style={styles.buttonText}>💬 Ver Comentarios</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Add to List Modal */}
      <AddToListModal
        visible={showAddToListModal}
        onClose={() => setShowAddToListModal(false)}
        book={book as Book}
        onSuccess={() => {
          console.log('Book added to list successfully');
        }}
      />

      {/* Comments Modal */}
      <CommentsModal
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        bookId={book.id}
        bookTitle={book.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5DC',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F8FF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4682B4',
    textAlign: 'center',
  },
  headerRight: {
    width: 34, // Same width as back button for centering
  },
  content: {
    flex: 1,
    color: '#333',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
  },
  bookContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    gap: 20,
  },
  bookCover: {
    width: 120,
    height: 180,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D2B48C',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  placeholderText: {
    fontSize: 40,
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    lineHeight: 14,
  },
  bookInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 10,
    marginBottom: 5,
  },
  authorText: {
    fontSize: 16,
    color: '#4682B4',
    fontWeight: '600',
    marginBottom: 5,
  },
  genreText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  descriptionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    textAlign: 'justify',
  },
  buttonsContainer: {
    gap: 15,
    marginBottom: 30,
  },
  actionButton: {
    backgroundColor: '#4682B4',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});