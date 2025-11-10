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
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth > 600;
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
            { color: i <= fullStars ? (theme as any).goldAccent : theme.textMuted }
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
          backgroundColor: theme.card,
          width: isTablet ? (screenWidth - 64) / 3 : (screenWidth - 48) / 2,
          minHeight: isTablet ? 380 : 320,
          borderColor: theme.border,
          shadowColor: theme.shadow,
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
          <View style={[styles.placeholderCover, {
            backgroundColor: (theme as any).pageYellow,
            borderColor: theme.tint
          }]}>
            <Text style={[styles.placeholderIcon, { color: theme.tint }]}>�</Text>
          </View>
        )}

        {/* Decorative corner ornament */}
        <View style={[styles.cornerOrnament, { backgroundColor: (theme as any).goldAccent }]}>
          <Text style={styles.ornamentText}>✦</Text>
        </View>
      </View>

      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
          {renderSafeText(safeBook.title, 'Título no disponible')}
        </Text>
        <Text style={[styles.bookAuthor, { color: theme.tint }]} numberOfLines={1}>
          por {renderSafeText(safeBook.authors, 'Autor desconocido')}
        </Text>

        {safeBook.averageRating && safeBook.averageRating > 0 && (
          <View style={styles.ratingContainer}>
            {renderStars(safeBook.averageRating)}
            <Text style={[styles.ratingText, { color: theme.textSecondary }]}>
              {renderSafeText(safeBook.averageRating.toFixed(1), '0.0')}
            </Text>
          </View>
        )}

        <Text style={[styles.bookDescription, { color: theme.textSecondary }]} numberOfLines={3}>
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
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5DC', // Pergamino base
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  placeholderIcon: {
    fontSize: Dimensions.get('window').width > 600 ? 48 : 42,
  },
  cornerOrnament: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  ornamentText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookInfo: {
    flex: 1,
    width: '100%',
    gap: 6,
  },
  bookTitle: {
    fontSize: Dimensions.get('window').width > 600 ? 18 : 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: Dimensions.get('window').width > 600 ? 24 : 22,
    letterSpacing: 0.3,
  },
  bookAuthor: {
    fontSize: Dimensions.get('window').width > 600 ? 15 : 13,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },
  star: {
    fontSize: Dimensions.get('window').width > 600 ? 16 : 14,
    marginHorizontal: 1,
  },
  ratingText: {
    fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  bookDescription: {
    fontSize: Dimensions.get('window').width > 600 ? 13 : 11,
    textAlign: 'center',
    lineHeight: Dimensions.get('window').width > 600 ? 18 : 16,
    flex: 1,
    fontStyle: 'italic',
  },
});