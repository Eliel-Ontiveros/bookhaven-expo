import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Book } from '@/lib/api/types';

interface SearchResultsProps {
  results: Book[];
  onBookPress: (book: Book) => void;
  onEndReached?: () => void;
  loading?: boolean;
  loadingMore?: boolean;
  /** Si es true, renderiza como View simple en lugar de FlatList (para usar dentro de ScrollView) */
  nestedInScrollView?: boolean;
}

export default function SearchResults({
  results,
  onBookPress,
  onEndReached,
  loading = false,
  loadingMore = false,
  nestedInScrollView = false
}: SearchResultsProps) {
  const renderBookItem = ({ item }: { item: Book }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => {
        onBookPress(item);
        router.push({
          pathname: '/book-detail',
          params: { book: JSON.stringify(item) }
        });
      }}
    >
      <View style={styles.bookCover}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.coverImage} />
        ) : (
          <View style={styles.placeholderCover}>
            <Text style={styles.placeholderText}>📖</Text>
          </View>
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>
          {item.authors}
        </Text>
        <Text style={styles.bookDescription} numberOfLines={3}>
          {item.description || 'Sin descripción disponible'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8B4513" />
      </View>
    );
  };

  if (loading && results.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Cargando recomendaciones...</Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontraron resultados</Text>
      </View>
    );
  }

  // Si está anidado en un ScrollView, renderizar como View simple para evitar el error
  if (nestedInScrollView) {
    // Agrupar items en filas de 2
    const rows: Book[][] = [];
    for (let i = 0; i < results.length; i += 2) {
      rows.push(results.slice(i, i + 2));
    }

    return (
      <View style={styles.container}>
        <View style={styles.listContainer}>
          {rows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <React.Fragment key={item.id}>
                  {renderBookItem({ item })}
                </React.Fragment>
              ))}
              {/* Si la fila tiene solo un elemento, agregar un espacio vacío */}
              {row.length === 1 && <View style={styles.emptyCard} />}
            </View>
          ))}
          {loadingMore && renderFooter()}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#CD5C5C',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    width: '100%',
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#000',
    padding: 15,
    width: '48%',
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
    width: 80,
    height: 100,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    fontSize: 30,
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
    marginTop: 10,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyCard: {
    width: '48%',
  },
});