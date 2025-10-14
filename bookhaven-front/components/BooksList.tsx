import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Book } from '@/lib/api/types';
import BookCard from './BookCard';

interface BooksListProps {
  books: Book[];
  loading: boolean;
  onBookPress: (book: Book) => void;
}

export default function BooksList({ books, loading, onBookPress }: BooksListProps) {
  const renderBookCard = ({ item }: { item: Book }) => (
    <BookCard book={item} onPress={onBookPress} />
  );

  return (
    <View style={styles.booksContainer}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔍 Buscando recomendaciones...</Text>
        </View>
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={renderBookCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.booksList}
          ItemSeparatorComponent={() => <View style={styles.bookSeparator} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>📚 No se encontraron recomendaciones</Text>
          <Text style={styles.emptySubtext}>Intenta con otros géneros o autores</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  booksContainer: {
    marginBottom: 30,
  },
  booksList: {
    paddingVertical: 10,
  },
  bookSeparator: {
    width: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});