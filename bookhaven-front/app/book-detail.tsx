import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

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
  const [userRating, setUserRating] = useState(0);
  const params = useLocalSearchParams();

  // Parse book data from params or use default data
  let book;
  try {
    book = params.book ? JSON.parse(params.book as string) : null;
  } catch (error) {
    book = null;
  }

  // Use passed book data or default data
  book = book || {
    id: '1',
    title: 'La metamorfosis',
    author: 'Franz Kafka',
    description: `Uno de los libros más singulares de la Europa del siglo XX, y sin duda uno de los más controvertidos de Franz Kafka, que ya es mucho, puesto que ninguna de sus obras suele dejar indiferente a nadie. Porque las autorías de este escritor checo doctorado en Derecho reflejan de una forma muy particular sus singularidades, puesto que todo en su vida iba en contra a su verdadera vocación, la literatura.Una obra de Kafka que refleja una visión del mundo verdaderamente particular y que vale la pena ser leída en detalle, para encontrar con cada nueva lectura, nueva comprensión, como quien quita las capas de una cebolla.Al despertar Gregorio Samsa una mañana, tras un sueño intranquilo, se encontró en su cama convertido en un monstruoso insecto. Tal es el abrupto comienzo, que nos sitúa de raíz bajo unas reglas distintas, de "La metamorfosis", sin duda alguna la obra de Franz Kafka que ha alcanzado mayor celebridad.Porque adquirir este libro: Por en esta apasionante obra encontrarás una pasión por los detalles, ya que el autor describe situaciones, paisajes y pensamientos con total profusión, sin descuidar absolutamente nada. Esto es algo que hace al lector ser parte de la propia narración, que a ratos parece sufrir tanto como el propio personaje principal.Una historia atrapante, incluso para aquel que ya la haya leído.`,
    genre: 'Alienation (Social psychology)',
    rating: 3.67,
    totalRatings: 3,
    coverUrl: undefined,
  };

  const handleRating = (rating: number) => {
    setUserRating(rating);
    console.log('User rated:', rating);
  };

  const renderStars = (rating: number, interactive: boolean = false, onPress?: (rating: number) => void) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      let starColor = '#DDD';
      let starText = '☆';

      if (i <= fullStars) {
        starColor = '#FFD700';
        starText = '★';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starColor = '#FFD700';
        starText = '★';
      }

      stars.push(
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => onPress && onPress(i)}
          style={styles.starButton}
        >
          <Text style={[styles.starText, { color: starColor }]}>
            {starText}
          </Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.starsContainer}>{stars}</View>;
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Book Title */}
        <Text style={styles.title}>{book.title}</Text>

        <View style={styles.bookContainer}>
          {/* Book Cover */}
          <View style={styles.bookCover}>
            {book.coverUrl ? (
              <Image source={{ uri: book.coverUrl }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderCover}>
                <View style={styles.kafkaBookCover}>
                  <Text style={styles.kafkaTitle}>La Metamorfosis</Text>
                  <View style={styles.kafkaPortrait}>
                    <Text style={styles.portraitText}>👤</Text>
                  </View>
                  <Text style={styles.kafkaAuthor}>Franz Kafka</Text>
                </View>
              </View>
            )}
          </View>

          {/* Book Details */}
          <View style={styles.bookDetails}>
            {/* Author */}
            <Text style={styles.authorLabel}>Autores: <Text style={styles.authorName}>{book.author}</Text></Text>

            {/* Genres */}
            <Text style={styles.genreLabel}>Géneros: <Text style={styles.genreName}>{book.genre}</Text></Text>
            <Text style={styles.subGenre}>Calificación comedia:</Text>

            {/* Rating */}
            <View style={styles.ratingSection}>
              {renderStars(book.rating || 0)}
              <Text style={styles.ratingText}>
                ({(book.rating || 0).toFixed(2)} de {book.totalRatings || 0} calificaciones)
              </Text>
            </View>

            {/* User Rating */}
            <View style={styles.userRatingSection}>
              <Text style={styles.userRatingLabel}>Tu calificación:</Text>
              {renderStars(userRating, true, handleRating)}
            </View>

            {/* Description */}
            <ScrollView style={styles.descriptionContainer} nestedScrollEnabled>
              <Text style={styles.description}>{book.description}</Text>
            </ScrollView>
          </View>
        </View>

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
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 20,
  },
  bookContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  bookCover: {
    width: 150,
    height: 200,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kafkaBookCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#D2B48C',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  kafkaTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
  },
  kafkaPortrait: {
    width: 60,
    height: 80,
    backgroundColor: '#8B4513',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portraitText: {
    fontSize: 30,
    color: '#FFFFFF',
  },
  kafkaAuthor: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookDetails: {
    flex: 1,
    paddingLeft: 10,
  },
  authorLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 8,
  },
  authorName: {
    fontWeight: 'bold',
  },
  genreLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 4,
  },
  genreName: {
    fontWeight: 'normal',
  },
  subGenre: {
    fontSize: 12,
    color: '#8B4513',
    marginBottom: 10,
  },
  ratingSection: {
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  starButton: {
    paddingHorizontal: 2,
  },
  starText: {
    fontSize: 20,
  },
  ratingText: {
    fontSize: 12,
    color: '#666',
  },
  userRatingSection: {
    marginBottom: 15,
  },
  userRatingLabel: {
    fontSize: 14,
    color: '#8B4513',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    backgroundColor: '#FFFACD',
    borderRadius: 10,
    padding: 15,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
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