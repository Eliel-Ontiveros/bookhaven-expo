import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface User {
    id: number;
    username: string;
    email: string;
    profile: {
        bio?: string;
    };
}

interface NewChatModalProps {
    visible: boolean;
    onClose: () => void;
    onStartChat: (userId: number) => Promise<void>;
    onSearchUsers: (query: string) => Promise<User[]>;
}

export default function NewChatModal({
    visible,
    onClose,
    onStartChat,
    onSearchUsers
}: NewChatModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [searching, setSearching] = useState(false);
    const [starting, setStarting] = useState<number | null>(null);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setSearching(true);
        try {
            const users = await onSearchUsers(query);
            setSearchResults(users);
        } catch (error) {
            Alert.alert('Error', 'No se pudieron buscar usuarios');
        } finally {
            setSearching(false);
        }
    };

    const handleStartChat = async (userId: number) => {
        setStarting(userId);
        try {
            await onStartChat(userId);
            onClose();
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            Alert.alert('Error', 'No se pudo iniciar la conversación');
        } finally {
            setStarting(null);
        }
    };

    const renderUserItem = ({ item }: { item: User }) => (
        <TouchableOpacity
            style={styles.userItem}
            onPress={() => handleStartChat(item.id)}
            disabled={starting === item.id}
        >
            <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                    {item.username.charAt(0).toUpperCase()}
                </Text>
            </View>

            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                {item.profile.bio && (
                    <Text style={styles.userBio} numberOfLines={1}>
                        {item.profile.bio}
                    </Text>
                )}
            </View>

            {starting === item.id ? (
                <ActivityIndicator size="small" color="#007AFF" />
            ) : (
                <Ionicons name="chevron-forward" size={20} color="#cccccc" />
            )}
        </TouchableOpacity>
    );

    if (!visible) return null;

    return (
        <View style={styles.overlay}>
            <View style={styles.modal}>
                <View style={styles.header}>
                    <Text style={styles.title}>Nueva conversación</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#333333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.searchContainer}>
                    <View style={styles.searchInputContainer}>
                        <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            placeholder="Buscar usuarios..."
                            autoFocus
                        />
                        {searching && (
                            <ActivityIndicator size="small" color="#007AFF" style={styles.searchLoader} />
                        )}
                    </View>
                </View>

                <View style={styles.resultsContainer}>
                    {searchQuery.length < 2 ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                Escribe al menos 2 caracteres para buscar usuarios
                            </Text>
                        </View>
                    ) : searchResults.length === 0 && !searching ? (
                        <View style={styles.emptyState}>
                            <Text style={styles.emptyText}>
                                No se encontraron usuarios
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={searchResults}
                            renderItem={renderUserItem}
                            keyExtractor={(item) => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        width: '90%',
        maxHeight: '80%',
        backgroundColor: '#ffffff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333333',
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        padding: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },
    searchLoader: {
        marginLeft: 8,
    },
    resultsContainer: {
        flex: 1,
        minHeight: 200,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    userInfo: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 2,
    },
    userBio: {
        fontSize: 14,
        color: '#666666',
    },
});