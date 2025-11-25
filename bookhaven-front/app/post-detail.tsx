import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
    Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService } from '@/lib/api/service';
import { Post, PostComment } from '@/lib/api/types';

export default function PostDetailScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { postId } = useLocalSearchParams();

    const [post, setPost] = useState<Post | null>(null);
    const [comments, setComments] = useState<PostComment[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingComments, setLoadingComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);

    useEffect(() => {
        if (postId) {
            loadPostDetails();
            loadComments();
        }
    }, [postId]);

    // Manejo del teclado para Android
    useEffect(() => {
        if (Platform.OS === 'android') {
            const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
                setKeyboardHeight(event.endCoordinates.height);
            });
            const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
                setKeyboardHeight(0);
            });

            return () => {
                keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
            };
        }
    }, []);

    const loadPostDetails = async () => {
        try {
            setLoading(true);
            const response = await apiService.getPost(Number(postId));
            if (response.success && response.data) {
                setPost(response.data);
            } else {
                Alert.alert('Error', response.error || 'No se pudo cargar el post');
                router.back();
            }
        } catch (error) {
            console.error('Error loading post:', error);
            Alert.alert('Error', 'Error al cargar el post');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async () => {
        try {
            setLoadingComments(true);
            const response = await apiService.getPostComments(Number(postId));
            if (response.success && response.data) {
                setComments(response.data);
            }
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Error', 'El comentario no puede estar vacío');
            return;
        }

        try {
            setSubmittingComment(true);
            const response = await apiService.createPostComment({
                postId: Number(postId),
                content: newComment.trim(),
            });

            if (response.success) {
                setNewComment('');
                loadComments(); // Recargar comentarios
                Alert.alert('Éxito', 'Comentario agregado');
            } else {
                Alert.alert('Error', response.error || 'No se pudo agregar el comentario');
            }
        } catch (error) {
            console.error('Error submitting comment:', error);
            Alert.alert('Error', 'Error al agregar comentario');
        } finally {
            setSubmittingComment(false);
        }
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

    const renderComment = (comment: PostComment) => (
        <View key={comment.id} style={[styles.commentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.commentHeader}>
                <TouchableOpacity
                    style={[styles.avatar, { backgroundColor: theme.tint }]}
                    onPress={() => {
                        router.push(`/user-profile?userId=${comment.user.id}` as any);
                    }}
                    activeOpacity={0.7}
                >
                    <Text style={styles.avatarText}>{comment.user.username.charAt(0).toUpperCase()}</Text>
                </TouchableOpacity>
                <View style={styles.commentUserInfo}>
                    <Text style={[styles.commentUsername, { color: theme.text }]}>{comment.user.username}</Text>
                    <Text style={[styles.commentDate, { color: theme.textSecondary }]}>
                        {formatDate(comment.createdAt)}
                    </Text>
                </View>
            </View>
            <Text style={[styles.commentContent, { color: theme.text }]}>{comment.content}</Text>
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.tint} />
                <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                    Cargando post...
                </Text>
            </View>
        );
    }

    if (!post) {
        return (
            <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
                <Ionicons name="alert-circle" size={64} color={theme.textSecondary} />
                <Text style={[styles.errorText, { color: theme.text }]}>Post no encontrado</Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: theme.tint }]}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 80}
        >
            {/* <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Post</Text>
                <View style={styles.headerButton} />
            </View> */}

            <ScrollView
                style={[
                    styles.content,
                    {
                        paddingBottom: Platform.OS === 'android' && keyboardHeight > 0 ? 30 : 0
                    }
                ]}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* Post principal */}
                <View style={[styles.postCard, { backgroundColor: theme.card }]}>
                    <View style={styles.postHeader}>
                        <View style={styles.userInfo}>
                            <TouchableOpacity
                                style={[styles.avatar, { backgroundColor: theme.tint }]}
                                onPress={() => {
                                    router.push(`/user-profile?userId=${post.user.id}` as any);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.avatarText}>{post.user.username.charAt(0).toUpperCase()}</Text>
                            </TouchableOpacity>
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
                            <TouchableOpacity
                                style={[styles.bookInfo, { backgroundColor: theme.background, borderColor: theme.border }]}
                                onPress={async () => {
                                    if (post.bookId) {
                                        try {
                                            // Obtenemos los detalles completos del libro usando la API
                                            const response = await apiService.getBookById(post.bookId);
                                            if (response.success && response.data) {
                                                router.push({
                                                    pathname: '/book-detail',
                                                    params: {
                                                        book: JSON.stringify(response.data),
                                                    },
                                                });
                                            } else {
                                                Alert.alert('Error', 'No se pudieron cargar los detalles del libro');
                                            }
                                        } catch (error) {
                                            console.error('Error loading book details:', error);
                                            Alert.alert('Error', 'Error al cargar los detalles del libro');
                                        }
                                    }
                                }}
                                disabled={!post.bookId}
                            >
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
                                {post.bookId && (
                                    <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Sección de comentarios */}
                <View style={styles.commentsSection}>
                    <Text style={[styles.commentsTitle, { color: theme.text }]}>
                        Comentarios ({comments.length})
                    </Text>

                    {loadingComments ? (
                        <View style={styles.commentsLoading}>
                            <ActivityIndicator size="small" color={theme.tint} />
                            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                Cargando comentarios...
                            </Text>
                        </View>
                    ) : comments.length === 0 ? (
                        <View style={styles.noCommentsContainer}>
                            <Ionicons name="chatbubble-outline" size={48} color={theme.textSecondary} />
                            <Text style={[styles.noCommentsText, { color: theme.textSecondary }]}>
                                No hay comentarios aún
                            </Text>
                            <Text style={[styles.noCommentsSubtext, { color: theme.textSecondary }]}>
                                Sé el primero en comentar
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.commentsList}>
                            {comments.map(renderComment)}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Área para agregar comentario */}
            <View style={[
                styles.commentInputContainer,
                {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border,
                    marginBottom: Platform.OS === 'android' && keyboardHeight > 0 ? 10 : 0
                }
            ]}>
                <TextInput
                    style={[styles.commentInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="Escribe un comentario..."
                    placeholderTextColor={theme.textSecondary}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    maxLength={300}
                />
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        { backgroundColor: newComment.trim() ? theme.tint : theme.textSecondary }
                    ]}
                    onPress={handleSubmitComment}
                    disabled={!newComment.trim() || submittingComment}
                >
                    {submittingComment ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Ionicons name="send" size={20} color="#FFFFFF" />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    errorText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 24,
    },
    backButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    postCard: {
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
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
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 26,
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
    commentsSection: {
        marginTop: 24,
        paddingBottom: 20,
    },
    commentsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    commentsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 20,
    },
    noCommentsContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    noCommentsText: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
    },
    noCommentsSubtext: {
        fontSize: 14,
        marginTop: 4,
    },
    commentsList: {
        gap: 12,
    },
    commentCard: {
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    commentUserInfo: {
        flex: 1,
    },
    commentUsername: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentDate: {
        fontSize: 12,
        marginTop: 1,
    },
    commentContent: {
        fontSize: 14,
        lineHeight: 18,
    },
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        paddingBottom: 18,
        borderTopWidth: 1,
        gap: 8,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        maxHeight: 100,
        fontSize: 16,
    },
    submitButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
});