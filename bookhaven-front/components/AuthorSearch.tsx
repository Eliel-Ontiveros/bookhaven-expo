import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';

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
    placeholder = "Escribe el nombre del autor..."
}: AuthorSearchProps) {
    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Buscar por autor:</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={authorQuery}
                    onChangeText={onAuthorChange}
                    placeholder={placeholder}
                    placeholderTextColor="#999"
                    autoCapitalize="words"
                    autoComplete="name"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8B4513',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: '#FFFACD',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#DDD',
        overflow: 'hidden',
    },
    input: {
        height: 50,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#8B4513',
    },
});