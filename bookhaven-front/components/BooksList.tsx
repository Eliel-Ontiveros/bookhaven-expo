import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Book } from '@/lib/api/types';
import BookCard from './BookCard';

interface BooksListProps {
  books: Book[];
  loading: boolean;
  loadingMore?: boolean;
  onBookPress: (book: Book) => void;
  onEndReached?: () => void;
  horizontal?: boolean;
}

export default function BooksList({
  books,
  loading,
  loadingMore = false,
  onBookPress,
  onEndReached,
  horizontal = false
}: BooksListProps) {
  const renderBookCard = ({ item }: { item: Book }) => (
    <BookCard book={item} onPress={onBookPress} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B4513" />
        <Text style={styles.loadingMoreText}>Cargando más libros...</Text>
      </View>
    );
  };

  return (
    <View style={[styles.booksContainer, !horizontal && styles.verticalContainer]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🔍 Buscando recomendaciones...</Text>
        </View>
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          renderItem={renderBookCard}
          keyExtractor={(item) => item.id}
          horizontal={horizontal}
          numColumns={horizontal ? 1 : 2}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            horizontal ? styles.booksList : styles.booksGrid,
            !horizontal && { flexGrow: 1 }
          ]}
          ItemSeparatorComponent={() => (
            <View style={horizontal ? styles.bookSeparator : styles.bookGridSeparator} />
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
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
  verticalContainer: {
    flex: 1,
    marginBottom: 0,
  },
  booksList: {
    paddingVertical: 10,
  },
  booksGrid: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  bookSeparator: {
    width: 15,
  },
  bookGridSeparator: {
    height: 15,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#8B4513',
    marginTop: 8,
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