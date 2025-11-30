import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Book } from '@/lib/api/types';
import SafeBookCard from './SafeBookCard';

interface BooksListProps {
  books: Book[];
  loading: boolean;
  loadingMore?: boolean;
  onBookPress: (book: Book) => void;
  onEndReached?: () => void;
  horizontal?: boolean;
  emptyMessage?: {
    title: string;
    subtitle: string;
    icon?: string;
  };
}

export default function BooksList({
  books,
  loading,
  loadingMore = false,
  onBookPress,
  onEndReached,
  horizontal = false,
  emptyMessage = {
    title: '📚 No se encontraron recomendaciones',
    subtitle: 'Intenta con otros géneros o autores',
    icon: '📚'
  }
}: BooksListProps) {
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth > 600;

  const renderBookCard = ({ item }: { item: Book }) => (
    <SafeBookCard book={item} onPress={onBookPress} />
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
          numColumns={horizontal ? 1 : (isTablet ? 3 : 2)}
          key={horizontal ? 'horizontal' : (isTablet ? 'tablet' : 'phone')} // Force re-render when orientation changes
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            horizontal ? styles.booksList : styles.booksGrid,
            !horizontal && {
              flexGrow: 1,
              paddingHorizontal: isTablet ? 16 : 8,
              paddingBottom: 20
            }
          ]}
          columnWrapperStyle={!horizontal && (isTablet ? 3 : 2) > 1 ? { justifyContent: 'space-between', paddingHorizontal: 4 } : undefined}
          ItemSeparatorComponent={() => (
            <View style={horizontal ? styles.bookSeparator : styles.bookGridSeparator} />
          )}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>{emptyMessage.icon}</Text>
          <Text style={styles.emptyText}>{emptyMessage.title}</Text>
          <Text style={styles.emptySubtext}>{emptyMessage.subtitle}</Text>
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
    paddingVertical: 8,
    paddingHorizontal: 0, // Remove horizontal padding since we're using columnWrapperStyle
  },
  bookSeparator: {
    width: 8,
  },
  bookGridSeparator: {
    height: 8,
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
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