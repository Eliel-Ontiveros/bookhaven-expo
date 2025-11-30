import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
    FlatList,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Header } from '@/components/ui';
import { ChatService } from '@/lib/api/chat';
import { API_CONFIG } from '@/lib/api/config';

interface UserProfile {
    user: {
        id: number;
        username: string;
        bio?: string;
        favoriteGenres: string[];
        totalLists: number;
    };
    bookLists: BookListInfo[];
}

interface BookListInfo {
    id: number;
    name: string;
    createdAt: string;
    totalBooks: number;
    recentBooks: BookEntry[];
}

interface BookEntry {
    id: number;
    addedAt: string;
    book: {
        id: string;
        title: string;
        authors: string;
        image?: string;
        categories: string[];
        averageRating?: number;
    };
}

export default function UserProfileScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId as string;
    const conversationId = params.conversationId as string;
    const conversationName = params.conversationName as string;
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userId) {
            fetchUserProfile();
        }
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/users/${userId}/profile`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al cargar el perfil');
            }

            if (data.success) {
                setProfile(data.data);
            } else {
                throw new Error('Error al obtener datos del perfil');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToChat = async () => {
        try {
            if (conversationId && conversationName) {
                // Si ya tenemos una conversación, navegar directamente
                router.push({
                    pathname: '/chat/[conversationId]',
                    params: {
                        conversationId,
                        conversationName
                    }
                });
            } else if (userId && profile) {
                // Si no tenemos conversación pero sí userId, crear una nueva conversación
                const token = await AsyncStorage.getItem('authToken');
                if (!token) {
                    Alert.alert('Error', 'Debes iniciar sesión para enviar mensajes');
                    return;
                }

                // Crear nueva conversación con este usuario
                const conversation = await ChatService.createConversation(
                    [userId], // Array con el ID del usuario destinatario
                    false, // No es grupo
                    undefined, // Sin nombre específico (será generado automáticamente)
                    token
                );

                // Navegar a la nueva conversación
                router.push({
                    pathname: '/chat/[conversationId]',
                    params: {
                        conversationId: conversation.id,
                        conversationName: profile.user.username
                    }
                });
            } else {
                Alert.alert('Error', 'No se pudo acceder al chat');
            }
        } catch (error) {
            console.error('Error creating conversation:', error);
            Alert.alert('Error', 'No se pudo crear la conversación. Inténtalo de nuevo.');
        }
    };

    const handleBookPress = (book: BookEntry['book']) => {
        router.push({
            pathname: '/book-detail',
            params: {
                book: JSON.stringify({
                    id: book.id,
                    title: book.title,
                    authors: book.authors,
                    image: book.image,
                    categories: book.categories,
                    averageRating: book.averageRating,
                    description: ''
                })
            }
        });
    };

    const renderBookItem = ({ item }: { item: BookEntry }) => (
        <TouchableOpacity
            style={styles.bookItem}
            onPress={() => handleBookPress(item.book)}
        >
            <Image
                source={{ uri: item.book.image || 'https://via.placeholder.com/100x150' }}
                style={styles.bookImage}
                resizeMode="cover"
            />
            <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>
                    {item.book.title}
                </Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>
                    {item.book.authors}
                </Text>
                <Text style={styles.bookDate}>
                    Agregado {format(new Date(item.addedAt), 'dd MMM yyyy', { locale: es })}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderBookList = ({ item }: { item: BookListInfo }) => (
        <View style={styles.bookListContainer}>
            <View style={styles.bookListHeader}>
                <Text style={styles.bookListName}>{item.name}</Text>
                <Text style={styles.bookCount}>{item.totalBooks} libro{item.totalBooks !== 1 ? 's' : ''}</Text>
            </View>
            {item.recentBooks.length > 0 ? (
                <FlatList
                    data={item.recentBooks}
                    renderItem={renderBookItem}
                    keyExtractor={(book) => book.id.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.booksHorizontalList}
                />
            ) : (
                <View style={styles.emptyListContainer}>
                    <Text style={styles.emptyListText}>Esta lista está vacía</Text>
                </View>
            )}
        </View>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                <Stack.Screen options={{ headerShown: false }} />
                <Header />

                <LinearGradient
                    colors={theme.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.logoMainContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="arrow-back" size={15} color="#FFFFFF" />
                        </View>
                        <Text style={styles.logoMainText}>Perfil de Usuario</Text>
                    </TouchableOpacity>
                </LinearGradient>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.tint} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Cargando perfil...</Text>
                </View>
            </View>
        );
    }

    if (error || !profile) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                <Stack.Screen options={{ headerShown: false }} />
                <Header />

                <LinearGradient
                    colors={theme.gradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.header}
                >
                    <TouchableOpacity onPress={() => router.back()} style={styles.logoMainContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="arrow-back" size={15} color="#FFFFFF" />
                        </View>
                        <Text style={styles.logoMainText}>Perfil de Usuario</Text>
                    </TouchableOpacity>
                </LinearGradient>
                <View style={styles.centerContainer}>
                    <Ionicons name="person-outline" size={80} color={theme.textMuted} />
                    <Text style={[styles.errorText, { color: theme.textSecondary }]}>{error || 'No se pudo cargar el perfil'}</Text>
                    <TouchableOpacity onPress={fetchUserProfile} style={[styles.retryButton, { backgroundColor: theme.tint }]}>
                        <Text style={styles.retryButtonText}>Reintentar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <Header />
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <Ionicons name="person-circle" size={100} color="#ccc" />
                    </View>
                    <Text style={styles.username}>{profile.user.username}</Text>
                    {profile.user.bio && (
                        <Text style={styles.bio}>{profile.user.bio}</Text>
                    )}

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>{profile.user.totalLists}</Text>
                            <Text style={styles.statLabel}>Lista{profile.user.totalLists !== 1 ? 's' : ''}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statNumber}>
                                {profile.bookLists.reduce((total, list) => total + list.totalBooks, 0)}
                            </Text>
                            <Text style={styles.statLabel}>Libros</Text>
                        </View>
                    </View>

                    {profile.user.favoriteGenres.length > 0 && (
                        <View style={styles.genresContainer}>
                            <Text style={styles.genresTitle}>Géneros favoritos:</Text>
                            <View style={styles.genresList}>
                                {profile.user.favoriteGenres.map((genre, index) => (
                                    <View key={index} style={styles.genreTag}>
                                        <Text style={styles.genreText}>{genre}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Botón de chat */}
                    <TouchableOpacity onPress={handleGoToChat} style={styles.chatButton}>
                        <Ionicons name="chatbubble-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.chatButtonText}>Enviar mensaje</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.listsSection}>
                    <Text style={styles.sectionTitle}>Listas de Libros</Text>
                    {profile.bookLists.length > 0 ? (
                        <FlatList
                            data={profile.bookLists}
                            renderItem={renderBookList}
                            keyExtractor={(list) => list.id.toString()}
                            scrollEnabled={false}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="book-outline" size={50} color="#ccc" />
                            <Text style={styles.emptyText}>No hay listas de libros</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 60,
    },
    logoMainContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoCircle: {
        width: 20,
        height: 20,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoMainText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 0.8,
    },
    navContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        opacity: 0.7,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        opacity: 0.7,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        backgroundColor: '#8B4513',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#F5F5DC',
        fontSize: 16,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(139, 69, 19, 0.1)',
    },
    avatarContainer: {
        marginBottom: 16,
        padding: 8,
        borderRadius: 60,
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
    },
    username: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
    },
    bio: {
        fontSize: 16,
        opacity: 0.8,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 22,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(139, 69, 19, 0.05)',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
    },
    statItem: {
        alignItems: 'center',
        marginHorizontal: 30,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#8B4513',
    },
    statLabel: {
        fontSize: 14,
        opacity: 0.7,
        marginTop: 4,
    },
    genresContainer: {
        alignItems: 'center',
    },
    genresTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    genresList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    genreTag: {
        backgroundColor: 'rgba(218, 165, 32, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        margin: 4,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.2)',
    },
    genreText: {
        fontSize: 14,
        color: '#8B4513',
        fontWeight: '500',
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#8B4513',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        gap: 8,
        marginTop: 16,
    },
    chatButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    listsSection: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 16,
        color: '#8B4513',
    },
    bookListContainer: {
        marginBottom: 24,
        backgroundColor: 'rgba(139, 69, 19, 0.05)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.1)',
    },
    bookListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookListName: {
        fontSize: 18,
        fontWeight: '600',
    },
    bookCount: {
        fontSize: 14,
        opacity: 0.7,
        color: '#8B4513',
    },
    booksHorizontalList: {
        paddingVertical: 8,
    },
    bookItem: {
        width: 120,
        marginRight: 12,
        backgroundColor: 'rgba(218, 165, 32, 0.1)',
        borderRadius: 8,
        padding: 8,
    },
    bookImage: {
        width: 104,
        height: 140,
        borderRadius: 6,
        marginBottom: 8,
        backgroundColor: '#8B4513',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 18,
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 12,
        opacity: 0.7,
        marginBottom: 4,
    },
    bookDate: {
        fontSize: 11,
        opacity: 0.6,
    },
    emptyListContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    emptyListText: {
        fontSize: 14,
        opacity: 0.6,
        fontStyle: 'italic',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        opacity: 0.6,
        marginTop: 12,
    },
});