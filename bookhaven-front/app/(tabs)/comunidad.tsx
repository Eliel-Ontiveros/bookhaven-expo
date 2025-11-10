import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/lib/api/service';
import { Post, Book } from '@/lib/api/types';
import BookListSelector from '@/components/BookListSelector';

interface PostsResponse {
    posts: Post[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export default function ComunidadScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBookSelector, setShowBookSelector] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [newPost, setNewPost] = useState({
        title: '',
        content: '',
        bookTitle: '',
        bookAuthor: '',
    });

    const loadPosts = useCallback(async () => {
        try {
            const response = await apiService.getPosts(1, 20);
            if (response.success && response.data) {
                setPosts(response.data.posts);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
            Alert.alert('Error', 'No se pudieron cargar las publicaciones');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadPosts();
    }, [loadPosts]);

    const handleCreatePost = async () => {
        if (!newPost.title.trim() || !newPost.content.trim()) {
            Alert.alert('Error', 'El título y contenido son obligatorios');
            return;
        }

        try {
            const postData = {
                title: newPost.title.trim(),
                content: newPost.content.trim(),
                bookTitle: selectedBook?.title || undefined,
                bookAuthor: selectedBook?.authors || undefined,
                bookId: selectedBook?.id || undefined,
            };

            const response = await apiService.createPost(postData);

            if (response.success) {
                setShowCreateModal(false);
                setNewPost({ title: '', content: '', bookTitle: '', bookAuthor: '' });
                setSelectedBook(null);
                loadPosts(); // Recargar los posts
                Alert.alert('Éxito', 'Publicación creada exitosamente');
            } else {
                Alert.alert('Error', response.error || 'No se pudo crear la publicación');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert('Error', 'No se pudo crear la publicación');
        }
    };

    const handleBookSelect = (book: Book) => {
        setSelectedBook(book);
        // Los datos del libro se tomarán directamente de selectedBook en handleCreatePost
    };

    const handleRemoveSelectedBook = () => {
        setSelectedBook(null);
        // No necesitamos limpiar los campos bookTitle y bookAuthor ya que no se muestran
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPost = (post: Post) => (
        <TouchableOpacity
            key={post.id}
            style={[styles.postCard, { backgroundColor: theme.card }]}
            onPress={() => {
                router.push(`/post-detail?postId=${post.id}` as any);
            }}
        >
            <View style={styles.postHeader}>
                <View style={styles.userInfo}>
                    <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                        <Text style={styles.avatarText}>{post.user.username.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={[styles.username, { color: theme.text }]}>{post.user.username}</Text>
                        <Text style={[styles.date, { color: theme.textSecondary }]}>
                            {formatDate(post.createdAt)}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.postContent}>
                <Text style={[styles.postTitle, { color: theme.text }]}>{post.title}</Text>
                <Text style={[styles.postText, { color: theme.text }]}>{post.content}</Text>

                {(post.bookTitle || post.bookAuthor) && (
                    <View style={[styles.bookInfo, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Ionicons name="book" size={16} color={theme.tint} />
                        <View style={styles.bookDetails}>
                            {post.bookTitle && (
                                <Text style={[styles.bookTitle, { color: theme.text }]}>{post.bookTitle}</Text>
                            )}
                            {post.bookAuthor && (
                                <Text style={[styles.bookAuthor, { color: theme.textSecondary }]}>
                                    por {post.bookAuthor}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.postActions}>
                    <View style={styles.commentAction}>
                        <Ionicons name="chatbubble-outline" size={16} color={theme.textSecondary} />
                        <Text style={[styles.actionText, { color: theme.textSecondary }]}>
                            Comentar
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.content}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, { color: theme.text }]}>Comunidad</Text>
                    <TouchableOpacity
                        style={[styles.createButton, { backgroundColor: theme.tint }]}
                        onPress={() => setShowCreateModal(true)}
                    >
                        <Ionicons name="add" size={20} color="#FFFFFF" />
                        <Text style={styles.createButtonText}>Nueva publicación</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                Cargando publicaciones...
                            </Text>
                        </View>
                    ) : posts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color={theme.textSecondary} />
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>
                                ¡Sé el primero en publicar!
                            </Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Comparte tus reseñas y recomendaciones de libros con la comunidad
                            </Text>
                        </View>
                    ) : (
                        posts.map(renderPost)
                    )}
                </ScrollView>
            </View>

            {/* Modal para crear nueva publicación */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <KeyboardAvoidingView
                    style={[styles.modalContainer, { backgroundColor: theme.background }]}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity
                            onPress={() => setShowCreateModal(false)}
                            style={styles.modalCloseButton}
                        >
                            <Text style={[styles.modalCloseText, { color: theme.textSecondary }]}>Cancelar</Text>
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Nueva Publicación</Text>
                        <TouchableOpacity
                            onPress={handleCreatePost}
                            style={[styles.modalSaveButton, { backgroundColor: theme.tint }]}
                        >
                            <Text style={styles.modalSaveText}>Publicar</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Título *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                                placeholder="Escribe un título llamativo..."
                                placeholderTextColor={theme.textSecondary}
                                value={newPost.title}
                                onChangeText={(text) => setNewPost(prev => ({ ...prev, title: text }))}
                                maxLength={100}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: theme.text }]}>Contenido *</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                                placeholder="Comparte tu opinión, reseña o recomendación..."
                                placeholderTextColor={theme.textSecondary}
                                value={newPost.content}
                                onChangeText={(text) => setNewPost(prev => ({ ...prev, content: text }))}
                                multiline
                                numberOfLines={6}
                                maxLength={500}
                            />
                        </View>

                        <View style={[styles.bookSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <Text style={[styles.bookSectionTitle, { color: theme.text }]}>
                                Información del libro (opcional)
                            </Text>

                            {selectedBook ? (
                                <>
                                    <View style={[styles.selectedBookContainer, { backgroundColor: theme.background, borderColor: theme.tint }]}>
                                        <View style={styles.selectedBookInfo}>
                                            <Ionicons name="book" size={20} color={theme.tint} />
                                            <View style={styles.selectedBookDetails}>
                                                <Text style={[styles.selectedBookTitle, { color: theme.text }]}>
                                                    {selectedBook.title}
                                                </Text>
                                                <Text style={[styles.selectedBookAuthor, { color: theme.textSecondary }]}>
                                                    por {selectedBook.authors}
                                                </Text>
                                                {selectedBook.categories && selectedBook.categories.length > 0 && (
                                                    <Text style={[styles.selectedBookCategories, { color: theme.textSecondary }]}>
                                                        {selectedBook.categories.join(', ')}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <TouchableOpacity
                                            onPress={handleRemoveSelectedBook}
                                            style={styles.removeBookButton}
                                        >
                                            <Ionicons name="close-circle" size={24} color={theme.textSecondary} />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.changeSelectionButton, { backgroundColor: theme.background, borderColor: theme.tint }]}
                                        onPress={() => setShowBookSelector(true)}
                                    >
                                        <Ionicons name="refresh" size={16} color={theme.tint} />
                                        <Text style={[styles.changeSelectionText, { color: theme.tint }]}>Cambiar selección</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.selectBookButton, { backgroundColor: theme.tint }]}
                                    onPress={() => setShowBookSelector(true)}
                                >
                                    <Ionicons name="library" size={20} color="#FFFFFF" />
                                    <Text style={styles.selectBookText}>Seleccionar de mis listas</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal del selector de libros */}
            <BookListSelector
                visible={showBookSelector}
                onClose={() => setShowBookSelector(false)}
                onBookSelect={handleBookSelect}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        gap: 6,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    loadingText: {
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 24,
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
    postCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: {
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        marginTop: 2,
    },
    postContent: {
        gap: 8,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 24,
    },
    postText: {
        fontSize: 16,
        lineHeight: 22,
    },
    bookInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 8,
    },
    bookDetails: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    bookAuthor: {
        fontSize: 12,
        marginTop: 2,
    },
    modalContainer: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    modalCloseButton: {
        paddingVertical: 8,
    },
    modalCloseText: {
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalSaveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    modalSaveText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    modalContent: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
    },
    textArea: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 120,
    },
    bookSection: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
    },
    bookSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 16,
    },
    selectBookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
        marginTop: 8,
    },
    selectBookText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    changeSelectionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 2,
        gap: 6,
        marginTop: 12,
    },
    changeSelectionText: {
        fontSize: 14,
        fontWeight: '600',
    },
    selectedBookContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        marginBottom: 8,
    },
    selectedBookInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        flex: 1,
    },
    selectedBookDetails: {
        flex: 1,
    },
    selectedBookTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 22,
    },
    selectedBookAuthor: {
        fontSize: 14,
        marginBottom: 4,
    },
    selectedBookCategories: {
        fontSize: 12,
        fontStyle: 'italic',
        lineHeight: 16,
    },
    removeBookButton: {
        padding: 4,
        marginLeft: 8,
    },
    postActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0, 0, 0, 0.1)',
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
    },
});