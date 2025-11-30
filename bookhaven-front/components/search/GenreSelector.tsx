import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface GenreSelectorProps {
  genres: string[];
  selectedGenres: string[];
  onGenreToggle: (genre: string) => void;
  visible: boolean;
}

export default function GenreSelector({ genres, selectedGenres, onGenreToggle, visible }: GenreSelectorProps) {
  if (!visible) return null;

  return (
    <View style={styles.genreSection}>
      <Text style={styles.genreTitle}>Selecciona géneros:</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genresList}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreChip,
              selectedGenres.includes(genre) && styles.genreChipSelected
            ]}
            onPress={() => onGenreToggle(genre)}
          >
            <Text style={[
              styles.genreChipText,
              selectedGenres.includes(genre) && styles.genreChipTextSelected
            ]}>
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  genreSection: {
    marginBottom: 25,
  },
  genreTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 15,
    textAlign: 'center',
  },
  genresList: {
    paddingHorizontal: 10,
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    marginHorizontal: 5,
  },
  genreChipSelected: {
    backgroundColor: '#CD5C5C',
    borderColor: '#CD5C5C',
  },
  genreChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  genreChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});