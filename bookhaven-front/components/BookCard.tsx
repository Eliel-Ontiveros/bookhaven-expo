import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Book } from '@/lib/api/types';

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth > 600;

  // Validar y limpiar los datos del libro de forma más estricta
  const safeBook = {
    id: book.id || `fallback_${Math.random()}`,
    title: (book.title && typeof book.title === 'string' && book.title.trim()) ? book.title.trim() : 'Título no disponible',
    authors: (book.authors && typeof book.authors === 'string' && book.authors.trim()) ? book.authors.trim() : 'Autor desconocido',
    description: (book.description && typeof book.description === 'string' && book.description.trim()) ? book.description.trim() : 'Sin descripción disponible',
    averageRating: (book.averageRating && typeof book.averageRating === 'number' && !isNaN(book.averageRating)) ? book.averageRating : 0,
    image: (book.image && typeof book.image === 'string' && book.image.trim()) ? book.image.trim() : undefined,
    categories: Array.isArray(book.categories) ? book.categories : ['General']
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text
          key={i}
          style={[
            styles.star,
            { color: i <= fullStars ? '#FFD700' : '#DDD' }
          ]}
        >
          ★
        </Text>
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  // Función auxiliar para renderizar texto de forma segura
  const renderSafeText = (text: any, fallback: string = '') => {
    if (text === null || text === undefined) return fallback;
    if (typeof text === 'string') return text;
    if (typeof text === 'number') return text.toString();
    return fallback;
  };

  return (
    <TouchableOpacity
      style={[
        styles.bookCard,
        {
          width: isTablet ? (screenWidth - 64) / 3 : (screenWidth - 48) / 2,
          minHeight: isTablet ? 380 : 320
        }
      ]}
      onPress={() => onPress(safeBook)}
    >
      <View style={[
        styles.bookCover,
        {
          height: isTablet ? 200 : 180
        }
      ]}>
        {safeBook.image ? (
          <Image source={{ uri: safeBook.image }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderIcon}>📖</Text>
          </View>
        )}
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {renderSafeText(safeBook.title, 'Título no disponible')}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {renderSafeText(safeBook.authors, 'Autor desconocido')}
        </Text>

        {safeBook.averageRating && safeBook.averageRating > 0 && (
          <View style={styles.ratingContainer}>
            {renderStars(safeBook.averageRating)}
            <Text style={styles.ratingText}>
              {renderSafeText(safeBook.averageRating.toFixed(1), '0.0')}
            </Text>
          </View>
        )}

        <Text style={styles.bookDescription} numberOfLines={3}>
          {(() => {
            const description = renderSafeText(safeBook.description, 'Sin descripción disponible');
            return description.length > 100 ? description.substring(0, 100) + '...' : description;
          })()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  bookCover: {
    width: '100%',
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
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
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  placeholderIcon: {
    fontSize: Dimensions.get('window').width > 600 ? 45 : 40,
    color: '#8B4513',
  },
  bookInfo: {
    flex: 1,
    width: '100%',
  },
  bookTitle: {
    fontSize: Dimensions.get('window').width > 600 ? 18 : 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: Dimensions.get('window').width > 600 ? 22 : 20,
  },
  bookAuthor: {
    fontSize: Dimensions.get('window').width > 600 ? 16 : 14,
    color: '#4682B4',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 5,
  },
  star: {
    fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
    marginHorizontal: 1,
  },
  ratingText: {
    fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
    color: '#666',
    fontWeight: 'bold',
  },
  bookDescription: {
    fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: Dimensions.get('window').width > 600 ? 18 : 16,
    flex: 1,
  },
});