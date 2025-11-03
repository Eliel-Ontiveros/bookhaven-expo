import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Alert,
    StyleSheet,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/lib/api/service';
import { BookList, Book, CreateBookListRequest, AddBookToListRequest } from '@/lib/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { BookHavenTheme, getThemeColors, getModalStyles } from '@/constants/modal-theme';

interface AddToListModalProps {
    visible: boolean;
    onClose: () => void;
    book: Book;
    onSuccess?: () => void;
}

export default function AddToListModal({ visible, onClose, book, onSuccess }: AddToListModalProps) {
    const [bookLists, setBookLists] = useState<BookList[]>([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = getThemeColors(isDark);
    const modalStyles = getModalStyles(isDark);

    useEffect(() => {
        if (visible) {
            fetchBookLists();
        }
    }, [visible]);

    const fetchBookLists = async () => {
        setLoading(true);
        try {
            const response = await apiService.getBookLists();
            if (response.success && response.data) {
                setBookLists(response.data);
            } else {
                Alert.alert('Error', response.error || 'No se pudieron cargar las listas');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al cargar las listas de lectura');
        } finally {
            setLoading(false);
        }
    };

    const addBookToList = async (listId: number) => {
        try {
            const bookData: AddBookToListRequest = {
                bookId: book.id,
                title: book.title,
                authors: book.authors || '',
                image: book.image || '',
                description: book.description || '',
                categories: book.categories || [],
                averageRating: book.averageRating || 0,
            };

            const response = await apiService.addBookToList(listId, bookData);

            if (response.success) {
                Alert.alert('¡Éxito!', 'Libro agregado a la lista de lectura');
                onSuccess?.();
                onClose();
            } else {
                Alert.alert('Error', response.error || 'No se pudo agregar el libro a la lista');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al agregar el libro a la lista');
        }
    };

    const createNewList = async () => {
        if (!newListName.trim()) {
            Alert.alert('Error', 'El nombre de la lista es requerido');
            return;
        }

        setCreating(true);
        try {
            const listData: CreateBookListRequest = {
                name: newListName.trim(),
            };

            const response = await apiService.createBookList(listData);

            if (response.success && response.data) {
                // Agregar el libro a la nueva lista
                await addBookToList(response.data.id);
                setNewListName('');
                setShowCreateForm(false);
                fetchBookLists(); // Actualizar la lista
            } else {
                Alert.alert('Error', response.error || 'No se pudo crear la lista');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al crear la nueva lista');
        } finally {
            setCreating(false);
        }
    };

    const renderListItem = ({ item }: { item: BookList }) => (
        <TouchableOpacity
            style={[
                modalStyles.listItem,
                {
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.lightGray,
                    marginBottom: BookHavenTheme.spacing.sm,
                    ...BookHavenTheme.shadows.small
                }
            ]}
            onPress={() => addBookToList(item.id)}
        >
            <View style={styles.listInfo}>
                <Text style={[modalStyles.body, { color: colors.text, fontWeight: '600' as const }]}>
                    {item.name}
                </Text>
                <Text style={[modalStyles.caption, { color: colors.textSecondary }]}>
                    {item.entries?.length || 0} libros
                </Text>
            </View>
            <View style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                <Ionicons
                    name="add"
                    size={18}
                    color={colors.white}
                />
            </View>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[modalStyles.modalContainer, { backgroundColor: colors.background }]}>
                {/* Header */}
                <View style={[modalStyles.header, { borderBottomColor: colors.gray }]}>
                    <TouchableOpacity
                        onPress={onClose}
                        style={[modalStyles.closeButton, { backgroundColor: colors.lightGray }]}
                    >
                        <Ionicons name="close" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[modalStyles.headerTitle, { color: colors.primary }]}>
                        Agregar a Lista
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Book Info */}
                <View style={[styles.bookInfo, {
                    borderBottomColor: colors.gray,
                    backgroundColor: colors.lightGray,
                    margin: BookHavenTheme.spacing.lg,
                    borderRadius: BookHavenTheme.borderRadius.lg,
                    borderBottomWidth: 0,
                    ...BookHavenTheme.shadows.small
                }]}>
                    <View style={styles.bookContainer}>
                        <View style={[styles.bookIcon, { backgroundColor: colors.primary }]}>
                            <Ionicons name="book" size={22} color={colors.white} />
                        </View>
                        <View style={styles.bookDetails}>
                            <Text style={[modalStyles.body, { color: colors.text, fontWeight: '600' as const }]}>
                                {book.title}
                            </Text>
                            {book.authors && (
                                <Text style={[modalStyles.caption, { color: colors.textSecondary }]}>
                                    por {book.authors}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {loading ? (
                        <View style={modalStyles.emptyContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[modalStyles.emptyText, { color: colors.textSecondary }]}>
                                Cargando listas...
                            </Text>
                        </View>
                    ) : (
                        <>
                            {/* Create New List Button */}
                            <TouchableOpacity
                                style={[modalStyles.primaryButton, { backgroundColor: colors.primary, marginBottom: BookHavenTheme.spacing.lg }]}
                                onPress={() => setShowCreateForm(!showCreateForm)}
                            >
                                <Ionicons name="add" size={20} color={colors.white} />
                                <Text style={[modalStyles.buttonText, { color: colors.white, marginLeft: BookHavenTheme.spacing.sm }]}>
                                    Crear Nueva Lista
                                </Text>
                            </TouchableOpacity>

                            {/* Create Form */}
                            {showCreateForm && (
                                <View style={[styles.createForm, { backgroundColor: colors.surface }]}>
                                    <TextInput
                                        style={[
                                            modalStyles.input,
                                            { backgroundColor: colors.background, borderColor: colors.gray, color: colors.text },
                                            isFocused && { borderColor: colors.primary }
                                        ]}
                                        placeholder="Nombre de la lista"
                                        placeholderTextColor={colors.textLight}
                                        value={newListName}
                                        onChangeText={setNewListName}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                    />
                                    <View style={styles.formButtons}>
                                        <TouchableOpacity
                                            style={[modalStyles.outlineButton, { borderColor: colors.gray, flex: 1 }]}
                                            onPress={() => setShowCreateForm(false)}
                                        >
                                            <Text style={[modalStyles.outlineButtonText, { color: colors.textSecondary }]}>
                                                Cancelar
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[modalStyles.secondaryButton, { backgroundColor: colors.secondary, flex: 1 }]}
                                            onPress={createNewList}
                                            disabled={creating}
                                        >
                                            {creating ? (
                                                <ActivityIndicator size="small" color={colors.white} />
                                            ) : (
                                                <Text style={[modalStyles.buttonText, { color: colors.white }]}>
                                                    Crear y Agregar
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                            {/* Lists */}
                            <Text style={[modalStyles.caption, {
                                color: colors.textSecondary,
                                fontWeight: '600' as const,
                                textTransform: 'uppercase' as const,
                                letterSpacing: 0.5,
                                marginBottom: BookHavenTheme.spacing.md
                            }]}>
                                Mis Listas de Lectura
                            </Text>

                            {bookLists.length === 0 ? (
                                <View style={modalStyles.emptyContainer}>
                                    <View style={[styles.emptyIcon, { backgroundColor: colors.lightGray }]}>
                                        <Ionicons
                                            name="library-outline"
                                            size={48}
                                            color={colors.textLight}
                                        />
                                    </View>
                                    <Text style={[modalStyles.emptyText, { color: colors.textSecondary }]}>
                                        No tienes listas de lectura aún
                                    </Text>
                                    <Text style={[modalStyles.emptySubtext, { color: colors.textLight }]}>
                                        Crea una nueva lista para organizar tus libros
                                    </Text>
                                </View>
                            ) : (
                                <FlatList
                                    data={bookLists}
                                    renderItem={renderListItem}
                                    keyExtractor={(item) => item.id.toString()}
                                    showsVerticalScrollIndicator={false}
                                />
                            )}
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
        padding: BookHavenTheme.spacing.lg,
        borderBottomWidth: 1,
    },
    cancelButton: {
        fontSize: 16,
        fontWeight: '400' as const,
    },
    title: {
        fontSize: 18,
        fontWeight: '600' as const,
    },
    bookInfo: {
        padding: BookHavenTheme.spacing.lg,
        borderBottomWidth: 1,
    },
    bookContainer: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        gap: BookHavenTheme.spacing.md,
    },
    bookIcon: {
        width: 44,
        height: 44,
        borderRadius: BookHavenTheme.borderRadius.md,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...BookHavenTheme.shadows.small,
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 14,
    },
    content: {
        flex: 1,
        padding: BookHavenTheme.spacing.lg,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    createButton: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        padding: BookHavenTheme.spacing.md,
        borderRadius: BookHavenTheme.borderRadius.md,
        marginBottom: BookHavenTheme.spacing.lg,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600' as const,
        marginLeft: BookHavenTheme.spacing.sm,
    },
    createForm: {
        padding: BookHavenTheme.spacing.lg,
        borderRadius: BookHavenTheme.borderRadius.lg,
        marginBottom: BookHavenTheme.spacing.lg,
        ...BookHavenTheme.shadows.small,
    },
    input: {
        borderWidth: 1,
        borderRadius: BookHavenTheme.borderRadius.md,
        padding: BookHavenTheme.spacing.md,
        fontSize: 16,
        marginBottom: BookHavenTheme.spacing.md,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top' as const,
    },
    formButtons: {
        flexDirection: 'row' as const,
        justifyContent: 'space-between' as const,
        gap: BookHavenTheme.spacing.md,
    },
    formButton: {
        flex: 1,
        padding: BookHavenTheme.spacing.md,
        borderRadius: BookHavenTheme.borderRadius.md,
        alignItems: 'center' as const,
    },
    formButtonText: {
        fontSize: 16,
        fontWeight: '600' as const,
        color: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: BookHavenTheme.spacing.md,
        textTransform: 'uppercase' as const,
        letterSpacing: 0.5,
    },
    listItem: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        padding: BookHavenTheme.spacing.lg,
        borderRadius: BookHavenTheme.borderRadius.lg,
        marginBottom: BookHavenTheme.spacing.sm,
    },
    listInfo: {
        flex: 1,
    },
    listName: {
        fontSize: 16,
        fontWeight: '600' as const,
        marginBottom: 4,
    },
    listDescription: {
        fontSize: 14,
        marginBottom: 4,
    },
    bookCount: {
        fontSize: 12,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: BookHavenTheme.borderRadius.md,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        ...BookHavenTheme.shadows.small,
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