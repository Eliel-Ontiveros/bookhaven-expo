import React from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface AuthorSearchProps {
    authorQuery: string;
    onAuthorChange: (text: string) => void;
    visible: boolean;
    placeholder?: string;
}

export default function AuthorSearch({
    authorQuery,
    onAuthorChange,
    visible,
    placeholder = "Ej: Stephen King, García Márquez, Tolkien..."
}: AuthorSearchProps) {
    if (!visible) return null;

    // Sugerencias populares de autores
    const popularAuthors = [
        'Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Agatha Christie',
        'Gabriel García Márquez', 'Isabel Allende', 'Paulo Coelho', 'Dan Brown'
    ];

    const handleSuggestionPress = (author: string) => {
        onAuthorChange(author);
    };

    const clearAuthor = () => {
        onAuthorChange('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.label}>Buscar por autor:</Text>
                {authorQuery.length > 0 && (
                    <TouchableOpacity onPress={clearAuthor} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Limpiar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={authorQuery}
                    onChangeText={onAuthorChange}
                    placeholder={placeholder}
                    placeholderTextColor="#999999"
                    autoCapitalize="words"
                    autoComplete="name"
                />
            </View>

            {/* Mostrar sugerencias solo si no hay texto o hay muy poco */}
            {authorQuery.length < 2 && (
                <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsLabel}>Autores populares:</Text>
                    <View style={styles.suggestionsGrid}>
                        {popularAuthors.slice(0, 4).map((author, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionChip}
                                onPress={() => handleSuggestionPress(author)}
                            >
                                <Text style={styles.suggestionText}>{author}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}

            {/* Indicador de búsqueda activa */}
            {authorQuery.length >= 2 && (
                <View style={styles.searchInfo}>
                    <Text style={styles.searchInfoText}>
                        🔍 Buscando libros de "{authorQuery}"
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },
    clearButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        backgroundColor: '#FF6B6B',
        borderRadius: 15,
    },
    clearButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        overflow: 'hidden',
    },
    input: {
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#000000',
    },
    suggestionsContainer: {
        marginTop: 12,
    },
    suggestionsLabel: {
        fontSize: 14,
        color: '#000000',
        marginBottom: 8,
        fontWeight: '500',
    },
    suggestionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    suggestionChip: {
        backgroundColor: '#E8F4FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#4682B4',
        margin: 2,
    },
    suggestionText: {
        color: '#4682B4',
        fontSize: 12,
        fontWeight: '500',
    },
    searchInfo: {
        marginTop: 8,
        padding: 10,
        backgroundColor: '#E8F5E8',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#4CAF50',
    },
    searchInfoText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '500',
    },
});