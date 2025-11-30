import React from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

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

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const clearAuthor = () => {
        onAuthorChange('');
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={[styles.label, { color: isDark ? '#FFFFFF' : '#333333' }]}>
                    Buscar por autor:
                </Text>
                {authorQuery.length > 0 && (
                    <TouchableOpacity onPress={clearAuthor} style={styles.clearButton}>
                        <Text style={styles.clearButtonText}>Limpiar</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.input, { color: '#000000' }]}
                    value={authorQuery}
                    onChangeText={onAuthorChange}
                    placeholder={placeholder}
                    placeholderTextColor={isDark ? '#999999' : '#666666'}
                    autoCapitalize="words"
                    autoComplete="name"
                />
            </View>

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