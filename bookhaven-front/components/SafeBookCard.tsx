import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Book } from '@/lib/api/types';

interface SafeBookCardProps {
    book: Book;
    onPress: (book: Book) => void;
}

export default function SafeBookCard({ book, onPress }: SafeBookCardProps) {
    const { width: screenWidth } = Dimensions.get('window');
    const isTablet = screenWidth > 600;

    // Función super segura para manejar cualquier valor
    const safeString = (value: any, fallback: string = ''): string => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === 'string') return value;
        if (typeof value === 'number') return value.toString();
        if (typeof value === 'boolean') return value.toString();
        try {
            return String(value);
        } catch {
            return fallback;
        }
    };

    // Validar datos del libro con defaults seguros
    const safeBook = {
        id: safeString(book.id, `temp_${Date.now()}`),
        title: safeString(book.title, 'Título no disponible'),
        authors: safeString(book.authors, 'Autor desconocido'),
        description: safeString(book.description, 'Sin descripción disponible'),
        averageRating: (typeof book.averageRating === 'number' && !isNaN(book.averageRating)) ? book.averageRating : 0,
        image: (book.image && typeof book.image === 'string' && book.image.trim()) ? book.image.trim() : undefined,
        categories: Array.isArray(book.categories) ? book.categories : ['General']
    };

    const renderStars = (rating: number) => {
        if (typeof rating !== 'number' || isNaN(rating)) return null;

        const stars = [];
        const fullStars = Math.floor(rating);

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text
                    key={`star-${i}`}
                    style={[
                        styles.star,
                        { color: i <= fullStars ? '#FFD700' : '#DDD' }
                    ]}
                >
                    ★
                </Text>
            );
        }

        return <View style={styles.starsContainer}>{stars}</View>;
    };

    const truncateText = (text: string, maxLength: number): string => {
        if (!text || typeof text !== 'string') return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <TouchableOpacity
            style={[
                styles.bookCard,
                {
                    width: isTablet ? (screenWidth - 64) / 3 : (screenWidth - 48) / 2,
                    minHeight: isTablet ? 380 : 320
                }
            ]}
            onPress={() => onPress(safeBook)}
        >
            <View style={[
                styles.bookCover,
                {
                    height: isTablet ? 200 : 180
                }
            ]}>
                {safeBook.image ? (
                    <Image source={{ uri: safeBook.image }} style={styles.coverImage} />
                ) : (
                    <View style={styles.placeholderCover}>
                        <Text style={styles.placeholderIcon}>📖</Text>
                    </View>
                )}
            </View>

            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                    {safeBook.title}
                </Text>

                <Text style={styles.bookAuthor} numberOfLines={1}>
                    {safeBook.authors}
                </Text>

                {safeBook.averageRating > 0 && (
                    <View style={styles.ratingContainer}>
                        {renderStars(safeBook.averageRating)}
                        <Text style={styles.ratingText}>
                            {safeBook.averageRating.toFixed(1)}
                        </Text>
                    </View>
                )}

                <Text style={styles.bookDescription} numberOfLines={3}>
                    {truncateText(safeBook.description, 100)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    bookCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    bookCover: {
        width: '100%',
        marginBottom: 10,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#F8F8F8',
    },
    coverImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderCover: {
        width: '100%',
        height: '100%',
        backgroundColor: '#D2B48C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#8B4513',
    },
    placeholderIcon: {
        fontSize: Dimensions.get('window').width > 600 ? 45 : 40,
        color: '#8B4513',
    },
    bookInfo: {
        flex: 1,
        width: '100%',
    },
    bookTitle: {
        fontSize: Dimensions.get('window').width > 600 ? 18 : 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 6,
        lineHeight: Dimensions.get('window').width > 600 ? 22 : 20,
    },
    bookAuthor: {
        fontSize: Dimensions.get('window').width > 600 ? 16 : 14,
        color: '#4682B4',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 5,
    },
    star: {
        fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
        marginHorizontal: 1,
    },
    ratingText: {
        fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
        color: '#666',
        fontWeight: 'bold',
    },
    bookDescription: {
        fontSize: Dimensions.get('window').width > 600 ? 14 : 12,
        color: '#666',
        textAlign: 'center',
        lineHeight: Dimensions.get('window').width > 600 ? 18 : 16,
        flex: 1,
    },
});