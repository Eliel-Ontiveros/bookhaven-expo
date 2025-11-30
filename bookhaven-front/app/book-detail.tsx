import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddToListModal, ChatbotModal } from '@/components/modals';
import { CommentsModal } from '@/components/comments';
import { StarRating } from '@/components/media';
import { Book } from '@/lib/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

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
  const [showChatbotModal, setShowChatbotModal] = useState(false);
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

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
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.heroTitle} numberOfLines={1}>
              {book.title}
            </Text>
            <View style={styles.headerRight} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Book Cover and Info Card */}
        <View style={[styles.bookCard, { backgroundColor: theme.card }]}>
          <View style={styles.bookCover}>
            {book.image ? (
              <Image source={{ uri: book.image }} style={styles.coverImage} />
            ) : (
              <View style={[styles.placeholderCover, { backgroundColor: theme.backgroundTertiary }]}>
                <Ionicons name="book" size={64} color={theme.icon} />
              </View>
            )}
          </View>

          <View style={styles.bookInfo}>
            <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
              {book.title}
            </Text>

            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={theme.icon} />
              <Text style={[styles.authorText, { color: theme.textSecondary }]}>
                {book.authors}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="pricetag-outline" size={18} color={theme.icon} />
              <Text style={[styles.genreText, { color: theme.textSecondary }]}>
                {Array.isArray(book.categories) && book.categories.length > 0
                  ? book.categories.join(', ')
                  : 'Género no especificado'}
              </Text>
            </View>

            <View style={styles.ratingContainer}>
              <StarRating
                bookId={book.id}
                size="medium"
                onRatingChange={(rating) => {
                  console.log('User rated book:', rating);
                }}
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={[styles.descriptionContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            📖 Sinopsis
          </Text>
          <Text style={[styles.descriptionText, { color: theme.textSecondary }]}>
            {book.description || 'No hay descripción disponible para este libro.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.tint }]}
            onPress={() => setShowAddToListModal(true)}
          >
            <Ionicons name="bookmark-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Agregar a Lista</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => setShowCommentsModal(true)}
          >
            <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Ver Comentarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => setShowChatbotModal(true)}
          >
            <Ionicons name="sparkles" size={20} color="#FFFFFF" />
            <Text style={styles.buttonText}>Asistente IA</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <AddToListModal
        visible={showAddToListModal}
        onClose={() => setShowAddToListModal(false)}
        book={book as Book}
        onSuccess={() => {
          console.log('Book added to list successfully');
        }}
      />

      <CommentsModal
        visible={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        bookId={book.id}
        bookTitle={book.title}
      />

      <ChatbotModal
        visible={showChatbotModal}
        onClose={() => setShowChatbotModal(false)}
        book={book as Book}
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
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  heroContent: {
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bookCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookCover: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
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
  },
  bookInfo: {
    gap: 16,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  genreText: {
    fontSize: 14,
    flex: 1,
  },
  ratingContainer: {
    marginTop: 8,
  },
  descriptionContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  buttonsContainer: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});