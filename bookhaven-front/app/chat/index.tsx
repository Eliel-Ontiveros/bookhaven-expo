import React, { useState, useEffect } from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    TextInput,
    Text,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ChatList from '../../components/ChatList';
import { useAuth } from '../../contexts/AuthContext';
import { ChatService, type Conversation as ChatConversation, type ChatUser } from '../../lib/api/chat';

interface User {
    id: number;
    username: string;
    email: string;
    profile: {
        bio?: string;
    };
}

export default function ChatIndexScreen() {
    const router = useRouter();
    const { user, token } = useAuth();

    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState<any>(null);

    useEffect(() => {
        if (user && token) {
            loadConversations();
        }
    }, [user, token]);

    const loadConversations = async () => {
        if (!token) return;

        try {
            console.log('🔄 Cargando conversaciones...');
            const conversationData = await ChatService.getConversations(token);
            console.log('💬 Conversaciones cargadas:', conversationData);
            setConversations(conversationData);
        } catch (error) {
            console.error('❌ Error al cargar conversaciones:', error);
            Alert.alert('Error', 'No se pudieron cargar las conversaciones');
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);

        // Limpiar búsqueda anterior
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (text.trim().length === 0) {
            setSearchResults([]);
            return;
        }

        // Debounce de 300ms para evitar demasiadas peticiones
        const timeout = setTimeout(async () => {
            if (text.trim().length >= 2) {
                await performSearch(text.trim());
            }
        }, 300);

        setSearchTimeout(timeout);
    };

    const performSearch = async (query: string) => {
        if (!token) return;

        setIsSearching(true);
        try {
            console.log('🔍 Buscando usuarios con:', query);
            const users = await ChatService.searchUsers(query, token);

            // Filtrar el usuario actual de los resultados
            const filteredUsers = users.filter(u => u.id !== user?.id.toString());
            setSearchResults(filteredUsers);
            console.log('👥 Usuarios encontrados:', filteredUsers);
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            Alert.alert('Error', 'No se pudieron buscar usuarios');
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const startChatWithUser = async (selectedUser: ChatUser) => {
        if (!token) return;

        try {
            console.log('💬 Iniciando chat con:', selectedUser.username);

            const conversation = await ChatService.createConversation(
                [selectedUser.id],
                false,
                undefined,
                token
            );

            // Limpiar búsqueda
            setSearchQuery('');
            setSearchResults([]);

            // Actualizar la lista de conversaciones
            setConversations(prev => {
                const exists = prev.find(c => c.id === conversation.id);
                if (exists) {
                    return prev;
                }
                return [conversation, ...prev];
            });

            // Navegar a la conversación
            router.push({
                pathname: '/chat/[conversationId]',
                params: {
                    conversationId: conversation.id,
                    conversationName: selectedUser.username
                }
            });
        } catch (error) {
            console.error('❌ Error al crear conversación:', error);
            Alert.alert('Error', 'No se pudo iniciar la conversación');
        }
    };

    const renderSearchResult = ({ item }: { item: ChatUser }) => (
        <TouchableOpacity
            style={styles.searchResultItem}
            onPress={() => startChatWithUser(item)}
            activeOpacity={0.7}
        >
            <View style={styles.searchResultAvatar}>
                <Text style={styles.searchResultAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                </Text>
            </View>
            <View style={styles.searchResultInfo}>
                <Text style={styles.searchResultUsername}>{item.username}</Text>
                <Text style={styles.searchResultEmail}>{item.email}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999999" />
        </TouchableOpacity>
    );

    const handleConversationPress = (conversation: ChatConversation) => {
        router.push({
            pathname: '/chat/[conversationId]',
            params: {
                conversationId: conversation.id,
                conversationName: getConversationName(conversation)
            }
        });
    };

    const getConversationName = (conversation: ChatConversation) => {
        if (conversation.isGroup) {
            return conversation.name || 'Chat grupal';
        }

        // Usar la nueva estructura donde participants son ChatUser directamente
        const otherUser = conversation.participants.find(
            p => p.id !== user?.id.toString()
        );
        return otherUser?.username || conversation.name || 'Usuario';
    };

    if (!user) {
        return null; // O mostrar pantalla de login
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <Stack.Screen
                options={{
                    title: 'Mensajes',
                }}
            />

            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                    <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar usuarios para chatear..."
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        placeholderTextColor="#999999"
                        autoCorrect={false}
                        autoCapitalize="none"
                    />
                    {(searchQuery.length > 0 || isSearching) && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                            }}
                            style={styles.clearButton}
                        >
                            {isSearching ? (
                                <ActivityIndicator size="small" color="#999999" />
                            ) : (
                                <Ionicons name="close" size={20} color="#999999" />
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Resultados de búsqueda */}
            {searchQuery.length > 0 && searchResults.length > 0 && (
                <View style={styles.searchResultsContainer}>
                    <FlatList
                        data={searchResults}
                        renderItem={renderSearchResult}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={false}
                        style={styles.searchResultsList}
                    />
                </View>
            )}

            {/* Lista de conversaciones */}
            <ChatList
                conversations={conversations}
                onConversationPress={handleConversationPress}
                loading={loading}
                currentUserId={user.id.toString()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        paddingVertical: 0,
    },
    clearButton: {
        padding: 4,
        marginLeft: 8,
    },
    searchResultsContainer: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        maxHeight: 200,
    },
    searchResultsList: {
        paddingHorizontal: 16,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    searchResultAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    searchResultAvatarText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchResultInfo: {
        flex: 1,
    },
    searchResultUsername: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 2,
    },
    searchResultEmail: {
        fontSize: 14,
        color: '#666666',
    },
    headerButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
});