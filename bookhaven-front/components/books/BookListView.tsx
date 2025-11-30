import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { apiService } from '@/lib/api/service';
import { BookList, Book } from '@/lib/api/types';
import BookCard from './BookCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookHavenTheme, getThemeColors, getModalStyles } from '@/constants/modal-theme';

interface BookListViewProps {
    listId: number;
    listName: string;
    onClose?: () => void;
}

export default function BookListView({ listId, listName, onClose }: BookListViewProps) {
    const [bookList, setBookList] = useState<BookList | null>(null);
    const [loading, setLoading] = useState(true);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getThemeColors(isDark);
    const modalStyles = getModalStyles(isDark);
    const { width: screenWidth } = Dimensions.get('window');

    useEffect(() => {
        if (listId) {
            loadBookList();
        }
    }, [listId]);

    const loadBookList = async () => {
        setLoading(true);
        try {
            const response = await apiService.getBookList(listId);
            if (response.success && response.data) {
                setBookList(response.data);
            } else {
                Alert.alert('Error', response.error || 'No se pudo cargar la lista');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al cargar la lista de libros');
        } finally {
            setLoading(false);
        }
    };

    const handleBookPress = (book: Book) => {
        router.push({
            pathname: '/book-detail',
            params: {
                book: JSON.stringify(book),
            },
        });
    };

    const handleRemoveBook = async (bookId: string) => {
        Alert.alert(
            'Eliminar Libro',
            '¿Estás seguro de que quieres eliminar este libro de la lista?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await apiService.removeBookFromList(listId, bookId);
                            if (response.success) {
                                Alert.alert('¡Éxito!', 'Libro eliminado de la lista');
                                loadBookList(); // Recargar la lista
                            } else {
                                Alert.alert('Error', response.error || 'No se pudo eliminar el libro');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Error al eliminar el libro');
                        }
                    }
                }
            ]
        );
    };

    const renderBook = ({ item }: { item: any }) => (
        <View style={styles.bookItemContainer}>
            <View style={styles.bookCardWrapper}>
                <BookCard
                    book={item.book}
                    onPress={() => handleBookPress(item.book)}
                />
            </View>
            <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: colors.error }]}
                onPress={() => handleRemoveBook(item.book.id)}
            >
                <Ionicons name="trash-outline" size={16} color={colors.white} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, modalStyles.emptyContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.loadingIcon, { backgroundColor: colors.primary }]}>
                    <ActivityIndicator size="large" color={colors.white} />
                </View>
                <Text style={[modalStyles.emptyText, { color: colors.textSecondary }]}>
                    Cargando libros...
                </Text>
            </View>
        );
    }

    if (!bookList) {
        return (
            <View style={[styles.container, modalStyles.emptyContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.errorIcon, { backgroundColor: colors.lightGray }]}>
                    <Ionicons name="alert-circle-outline" size={48} color={colors.textLight} />
                </View>
                <Text style={[modalStyles.emptyText, { color: colors.textSecondary }]}>
                    No se pudo cargar la lista
                </Text>
                {onClose && (
                    <TouchableOpacity
                        style={[modalStyles.primaryButton, { backgroundColor: colors.primary }]}
                        onPress={onClose}
                    >
                        <Text style={[modalStyles.buttonText, { color: colors.white }]}>Volver</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    const books = bookList.entries || [];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[modalStyles.header, { borderBottomColor: colors.gray }]}>
                {onClose && (
                    <TouchableOpacity
                        onPress={onClose}
                        style={[modalStyles.closeButton, { backgroundColor: colors.lightGray }]}
                    >
                        <Ionicons name="arrow-back" size={20} color={colors.primary} />
                    </TouchableOpacity>
                )}
                <View style={styles.headerContent}>
                    <View style={[styles.listIcon, { backgroundColor: colors.primary }]}>
                        <Ionicons name="list" size={20} color={colors.white} />
                    </View>
                    <Text style={[modalStyles.subtitle, { color: colors.text }]}>
                        {listName}
                    </Text>
                    <Text style={[modalStyles.caption, { color: colors.textSecondary }]}>
                        {books.length} {books.length === 1 ? 'libro' : 'libros'}
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Books List */}
            {books.length === 0 ? (
                <View style={modalStyles.emptyContainer}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.lightGray }]}>
                        <Ionicons name="library-outline" size={48} color={colors.textLight} />
                    </View>
                    <Text style={[modalStyles.emptyText, { color: colors.textSecondary }]}>
                        Esta lista está vacía
                    </Text>
                    <Text style={[modalStyles.emptySubtext, { color: colors.textLight }]}>
                        Agrega libros desde la pantalla de detalles
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={books}
                    renderItem={renderBook}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={screenWidth > 600 ? 3 : 2}
                    contentContainerStyle={styles.booksContainer}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: BookHavenTheme.spacing.lg,
        paddingVertical: BookHavenTheme.spacing.md,
        borderBottomWidth: 1,
    },
    backButton: {
        marginRight: BookHavenTheme.spacing.md,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center' as const,
        gap: BookHavenTheme.spacing.xs,
    },
    listIcon: {
        width: 32,
        height: 32,
        borderRadius: BookHavenTheme.borderRadius.md,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...BookHavenTheme.shadows.small,
    },
    listTitle: {
        fontSize: 20,
        fontWeight: 'bold' as const,
        marginBottom: 4,
    },
    bookCount: {
        fontSize: 14,
    },
    loadingIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: BookHavenTheme.spacing.lg,
        ...BookHavenTheme.shadows.medium,
    },
    loadingText: {
        marginTop: BookHavenTheme.spacing.md,
        fontSize: 16,
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: BookHavenTheme.spacing.lg,
    },
    errorText: {
        fontSize: 18,
        textAlign: 'center' as const,
        marginTop: BookHavenTheme.spacing.lg,
        marginBottom: BookHavenTheme.spacing.xl,
    },
    retryButton: {
        paddingHorizontal: BookHavenTheme.spacing.xl,
        paddingVertical: BookHavenTheme.spacing.md,
        borderRadius: BookHavenTheme.borderRadius.md,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as const,
    },
    booksContainer: {
        padding: BookHavenTheme.spacing.lg,
    },
    bookItemContainer: {
        flex: 1,
        margin: BookHavenTheme.spacing.sm,
        position: 'relative' as const,
    },
    bookCardWrapper: {
        flex: 1,
    },
    removeButton: {
        position: 'absolute' as const,
        top: BookHavenTheme.spacing.sm,
        right: BookHavenTheme.spacing.sm,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...BookHavenTheme.shadows.medium,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        paddingHorizontal: BookHavenTheme.spacing.xxxl,
    },
    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        marginBottom: BookHavenTheme.spacing.lg,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600' as const,
        textAlign: 'center' as const,
        marginTop: BookHavenTheme.spacing.lg,
        marginBottom: BookHavenTheme.spacing.sm,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center' as const,
        lineHeight: 20,
    },
});