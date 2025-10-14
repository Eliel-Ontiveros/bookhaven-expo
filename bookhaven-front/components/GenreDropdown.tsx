import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface GenreDropdownProps {
    selectedGenre: string;
    onGenreChange: (genre: string) => void;
    visible: boolean;
}

const genres = [
    { label: 'Todos los géneros', value: '' },
    { label: 'Ficción', value: 'fiction' },
    { label: 'Romance', value: 'romance' },
    { label: 'Fantasía', value: 'fantasy' },
    { label: 'Misterio', value: 'mystery' },
    { label: 'Ciencia Ficción', value: 'science fiction' },
    { label: 'Historia', value: 'history' },
    { label: 'Biografía', value: 'biography' },
    { label: 'Poesía', value: 'poetry' },
    { label: 'Drama', value: 'drama' },
    { label: 'Aventura', value: 'adventure' },
    { label: 'Terror', value: 'horror' },
    { label: 'Comedia', value: 'humor' },
    { label: 'Filosofía', value: 'philosophy' },
    { label: 'Religión', value: 'religion' },
    { label: 'Autoayuda', value: 'self help' },
    { label: 'Negocios', value: 'business' },
    { label: 'Ciencia', value: 'science' },
    { label: 'Tecnología', value: 'technology' },
    { label: 'Arte', value: 'art' },
    { label: 'Música', value: 'music' },
    { label: 'Cocina', value: 'cooking' },
    { label: 'Salud', value: 'health' },
    { label: 'Deportes', value: 'sports' },
    { label: 'Viajes', value: 'travel' }
];

export default function GenreDropdown({ selectedGenre, onGenreChange, visible }: GenreDropdownProps) {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedGenre}
                    onValueChange={onGenreChange}
                    style={styles.picker}
                    dropdownIconColor="#8B4513"
                >
                    {genres.map((genre) => (
                        <Picker.Item
                            key={genre.value}
                            label={genre.label}
                            value={genre.value}
                            style={styles.pickerItem}
                        />
                    ))}
                </Picker>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    pickerContainer: {
        backgroundColor: '#FFFACD',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        color: '#8B4513',
    },
    pickerItem: {
        fontSize: 16,
        color: '#8B4513',
    },
});