import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface FilterButtonsProps {
  filterBy: 'author' | 'genre';
  onFilterChange: (filter: 'author' | 'genre') => void;
}

export default function FilterButtons({ filterBy, onFilterChange }: FilterButtonsProps) {
  return (
    <View style={styles.filterButtons}>
      <TouchableOpacity 
        style={[
          styles.filterButton,
          filterBy === 'author' && styles.filterButtonActive
        ]}
        onPress={() => onFilterChange('author')}
      >
        <Text style={[
          styles.filterButtonText,
          filterBy === 'author' && styles.filterButtonTextActive
        ]}>
          Filtrar por autor
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.filterButton,
          filterBy === 'genre' && styles.filterButtonActive
        ]}
        onPress={() => onFilterChange('genre')}
      >
        <Text style={[
          styles.filterButtonText,
          filterBy === 'genre' && styles.filterButtonTextActive
        ]}>
          Filtrar por género
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 15,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  filterButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});