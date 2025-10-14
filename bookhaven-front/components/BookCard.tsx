import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Book } from '@/lib/api/types';

interface BookCardProps {
  book: Book;
  onPress: (book: Book) => void;
}

export default function BookCard({ book, onPress }: BookCardProps) {
  return (
    <TouchableOpacity style={styles.bookCard} onPress={() => onPress(book)}>
      <View style={styles.bookCover}>
        {book.image && (
          <Image source={{ uri: book.image }} style={styles.coverImage} />
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {book.authors}
        </Text>
        <Text style={styles.bookDescription} numberOfLines={3}>
          {book.description || 'Sin descripción disponible'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000',
    padding: 15,
    width: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookCover: {
    width: 120,
    height: 150,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bookInfo: {
    alignItems: 'center',
    width: '100%',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  bookDescription: {
    fontSize: 10,
    color: '#888',
    textAlign: 'center',
    lineHeight: 12,
  },
});