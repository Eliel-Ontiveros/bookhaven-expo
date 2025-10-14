import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { Book } from '@/lib/api/types';

interface SearchResultsProps {
  results: Book[];
  onBookPress: (book: Book) => void;
}

export default function SearchResults({ results, onBookPress }: SearchResultsProps) {
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

  if (results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No se encontraron resultados</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados de búsqueda</Text>
      <FlatList
        data={results}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
    justifyContent: 'space-between',
    marginBottom: 15,
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
});