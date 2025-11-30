import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/lib/api/service';
import { BookList, Book } from '@/lib/api/types';

interface BookListSelectorProps {
    visible: boolean;
    onClose: () => void;
    onBookSelect: (book: Book) => void;
}

export default function BookListSelector({ visible, onClose, onBookSelect }: BookListSelectorProps) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [bookLists, setBookLists] = useState<BookList[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedLists, setExpandedLists] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (visible) {
            loadBookLists();
        }
    }, [visible]);

    const loadBookLists = async () => {
        setLoading(true);
        try {
            const response = await apiService.getBookLists();
            if (response.success && response.data) {
                setBookLists(response.data);
                // Expandir automáticamente las listas que tienen libros
                const listsWithBooks = response.data.filter(list => list.entries.length > 0);
                setExpandedLists(new Set(listsWithBooks.map(list => list.id)));
            } else {
                Alert.alert('Error', response.error || 'No se pudieron cargar las listas');
            }
        } catch (error) {
            console.error('Error loading book lists:', error);
            Alert.alert('Error', 'Error al cargar las listas de libros');
        } finally {
            setLoading(false);
        }
    };

    const toggleListExpansion = (listId: number) => {
        const newExpanded = new Set(expandedLists);
        if (newExpanded.has(listId)) {
            newExpanded.delete(listId);
        } else {
            newExpanded.add(listId);
        }
        setExpandedLists(newExpanded);
    };

    const handleBookSelect = (book: Book) => {
        onBookSelect(book);
        onClose();
    };

    const filteredLists = bookLists.filter(list => {
        if (!searchQuery.trim()) return list.entries.length > 0;

        return (
            list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            list.entries.some(entry =>
                entry.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.book.authors.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    });

    const filteredBooks = (list: BookList) => {
        if (!searchQuery.trim()) return list.entries;

        return list.entries.filter(entry =>
            entry.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.book.authors.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    const renderBookItem = (entry: any) => (
        <TouchableOpacity
            key={entry.id}
            style={[styles.bookItem, { backgroundColor: theme.background, borderColor: theme.border }]}
            onPress={() => handleBookSelect(entry.book)}
        >
            <View style={styles.bookInfo}>
                <Text style={[styles.bookTitle, { color: theme.text }]} numberOfLines={2}>
                    {entry.book.title}
                </Text>
                <Text style={[styles.bookAuthor, { color: theme.textSecondary }]} numberOfLines={1}>
                    {entry.book.authors}
                </Text>
                {entry.book.categories && entry.book.categories.length > 0 && (
                    <Text style={[styles.bookCategories, { color: theme.textSecondary }]} numberOfLines={1}>
                        {entry.book.categories.join(', ')}
                    </Text>
                )}
            </View>
            <Ionicons name="add-circle" size={24} color={theme.tint} />
        </TouchableOpacity>
    );

    const renderList = (list: BookList) => {
        const booksToShow = filteredBooks(list);
        if (booksToShow.length === 0) return null;

        const isExpanded = expandedLists.has(list.id);

        return (
            <View key={list.id} style={[styles.listContainer, { backgroundColor: theme.card }]}>
                <TouchableOpacity
                    style={styles.listHeader}
                    onPress={() => toggleListExpansion(list.id)}
                >
                    <View style={styles.listTitleContainer}>
                        <Ionicons
                            name="list"
                            size={20}
                            color={theme.tint}
                            style={styles.listIcon}
                        />
                        <Text style={[styles.listTitle, { color: theme.text }]}>
                            {list.name}
                        </Text>
                        <Text style={[styles.bookCount, { color: theme.textSecondary }]}>
                            ({booksToShow.length} {booksToShow.length === 1 ? 'libro' : 'libros'})
                        </Text>
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.booksContainer}>
                        {booksToShow.map(renderBookItem)}
                    </View>
                )}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={[styles.header, { borderBottomColor: theme.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={[styles.closeText, { color: theme.textSecondary }]}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text }]}>Seleccionar Libro</Text>
                    <View style={styles.placeholder} />
                </View>

                <View style={styles.searchContainer}>
                    <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <Ionicons name="search" size={20} color={theme.textSecondary} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.text }]}
                            placeholder="Buscar en tus listas..."
                            placeholderTextColor={theme.textSecondary}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={theme.tint} />
                        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                            Cargando tus listas...
                        </Text>
                    </View>
                ) : filteredLists.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="library-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>
                            {searchQuery ? 'Sin resultados' : 'No tienes libros guardados'}
                        </Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            {searchQuery
                                ? 'Prueba con otro término de búsqueda'
                                : 'Agrega libros a tus listas para poder seleccionarlos aquí'
                            }
                        </Text>
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {filteredLists.map(renderList)}
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        paddingVertical: 8,
    },
    closeText: {
        fontSize: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    placeholder: {
        width: 60, // Para balancear el botón de cerrar
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 22,
    },
    listContainer: {
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    listTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    listIcon: {
        marginRight: 8,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    bookCount: {
        fontSize: 14,
    },
    booksContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    bookItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    bookInfo: {
        flex: 1,
        marginRight: 12,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 13,
        marginBottom: 2,
    },
    bookCategories: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});