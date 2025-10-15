import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@/lib/api/service';
import { Comment, CreateCommentRequest } from '@/lib/api/types';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface CommentsProps {
    bookId: string;
}

export default function Comments({ bookId }: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        if (bookId) {
            fetchComments();
        }
    }, [bookId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await apiService.getBookComments(bookId);
            if (response.success && response.data) {
                // Validar y limpiar los datos de comentarios
                const safeComments = response.data.map((comment: any) => ({
                    id: comment.id || 0,
                    content: comment.content && typeof comment.content === 'string'
                        ? comment.content
                        : 'Comentario no disponible',
                    createdAt: comment.createdAt || new Date().toISOString(),
                    bookId: comment.bookId || bookId,
                    userId: comment.userId || 0,
                    user: {
                        id: comment.user?.id || 0,
                        username: comment.user?.username && typeof comment.user.username === 'string'
                            ? comment.user.username
                            : 'Usuario desconocido'
                    }
                }));

                console.log('📋 Safe comments processed:', safeComments.length);
                setComments(safeComments);
            } else {
                console.error('Error fetching comments:', response.error);
                Alert.alert('Error', response.error || 'No se pudieron cargar los comentarios');
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            Alert.alert('Error', 'Error al cargar los comentarios');
        } finally {
            setLoading(false);
        }
    };

    const addComment = async () => {
        if (!newComment.trim()) {
            Alert.alert('Error', 'El comentario no puede estar vacío');
            return;
        }

        setPosting(true);
        try {
            const commentData: CreateCommentRequest = {
                bookId,
                content: newComment.trim(),
            };

            const response = await apiService.createComment(commentData);

            if (response.success && response.data) {
                setComments(prev => [response.data!, ...prev]);
                setNewComment('');
                Alert.alert('¡Éxito!', 'Comentario agregado correctamente');
            } else {
                Alert.alert('Error', response.error || 'No se pudo agregar el comentario');
            }
        } catch (error) {
            Alert.alert('Error', 'Error al agregar el comentario');
        } finally {
            setPosting(false);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return 'Fecha no disponible';
        }
    };

    const renderComment = ({ item }: { item: Comment }) => {
        // Validación defensiva para datos del usuario
        const safeUser = {
            id: item.user?.id || 0,
            username: item.user?.username && typeof item.user.username === 'string'
                ? item.user.username
                : 'Usuario desconocido'
        };

        const safeComment = {
            id: item.id || 0,
            content: item.content && typeof item.content === 'string'
                ? item.content
                : 'Comentario no disponible',
            createdAt: item.createdAt || new Date().toISOString(),
            user: safeUser
        };

        return (
            <View style={[styles.commentItem, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <View style={styles.commentHeader}>
                    <View style={[styles.avatar, { backgroundColor: isDark ? '#48484A' : '#C7C7CC' }]}>
                        <Text style={[styles.avatarText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {safeComment.user.username.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.commentMeta}>
                        <Text style={[styles.username, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {safeComment.user.username}
                        </Text>
                        <Text style={[styles.date, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                            {formatDate(safeComment.createdAt)}
                        </Text>
                    </View>
                </View>
                <Text style={[styles.commentContent, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {safeComment.content}
                </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#FFFFFF' }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color={isDark ? '#007AFF' : '#007AFF'}
                />
                <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Comentarios ({comments.length})
                </Text>
            </View>

            {/* Add Comment Form */}
            <View style={[styles.addCommentContainer, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                <TextInput
                    style={[styles.commentInput, {
                        backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                        color: isDark ? '#FFFFFF' : '#000000',
                        borderColor: isDark ? '#38383A' : '#C6C6C8'
                    }]}
                    placeholder="Escribe tu comentario..."
                    placeholderTextColor={isDark ? '#8E8E93' : '#6D6D70'}
                    value={newComment}
                    onChangeText={setNewComment}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                />
                <TouchableOpacity
                    style={[styles.postButton, {
                        backgroundColor: newComment.trim() ? '#007AFF' : (isDark ? '#2C2C2E' : '#E5E5EA'),
                        opacity: newComment.trim() ? 1 : 0.6
                    }]}
                    onPress={addComment}
                    disabled={posting || !newComment.trim()}
                >
                    {posting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Ionicons name="send" size={16} color="#FFFFFF" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Comments List */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={isDark ? '#007AFF' : '#007AFF'} />
                    <Text style={[styles.loadingText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        Cargando comentarios...
                    </Text>
                </View>
            ) : comments.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons
                        name="chatbubble-outline"
                        size={48}
                        color={isDark ? '#8E8E93' : '#6D6D70'}
                    />
                    <Text style={[styles.emptyText, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        No hay comentarios aún
                    </Text>
                    <Text style={[styles.emptySubtext, { color: isDark ? '#8E8E93' : '#6D6D70' }]}>
                        Sé el primero en comentar este libro
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={comments}
                    renderItem={renderComment}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.commentsContainer}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 8,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        borderBottomWidth: 0.5,
        gap: 12,
    },
    commentInput: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
        minHeight: 44,
        maxHeight: 100,
    },
    postButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    commentsContainer: {
        padding: 16,
    },
    commentItem: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    commentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentMeta: {
        flex: 1,
    },
    username: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    date: {
        fontSize: 12,
    },
    commentContent: {
        fontSize: 15,
        lineHeight: 20,
    },
});