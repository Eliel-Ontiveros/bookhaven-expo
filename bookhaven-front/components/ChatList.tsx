import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Conversation } from '../lib/api/chat';

interface ChatListProps {
    conversations: Conversation[];
    onConversationPress: (conversation: Conversation) => void;
    loading?: boolean;
    currentUserId: string;
}

export default function ChatList({
    conversations,
    onConversationPress,
    loading = false,
    currentUserId
}: ChatListProps) {
    const getConversationName = (conversation: Conversation) => {
        console.log('🔍 getConversationName - Conversation:', {
            id: conversation.id,
            name: conversation.name,
            isGroup: conversation.isGroup,
            participants: conversation.participants,
            currentUserId
        });

        if (conversation.isGroup) {
            return conversation.name || 'Chat grupal';
        }

        // Para chat 1:1, mostrar el nombre del otro usuario
        const otherUser = conversation.participants.find(
            p => p.id !== currentUserId
        );

        console.log('👤 Other user found:', otherUser);
        const name = otherUser?.username || conversation.name || 'Usuario';
        console.log('📝 Final conversation name:', name);

        return name;
    };

    const formatLastMessageTime = (dateString?: string) => {
        if (!dateString) return '';

        const date = new Date(dateString);

        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return 'Ayer';
        } else {
            return format(date, 'dd/MM/yyyy');
        }
    };

    const renderConversationItem = ({ item }: { item: Conversation }) => {
        if (!item) {
            return null;
        }

        return (
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => onConversationPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {getConversationName(item).charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.conversationInfo}>
                    <View style={styles.conversationHeader}>
                        <Text style={styles.conversationName} numberOfLines={1}>
                            {getConversationName(item)}
                        </Text>
                        <Text style={styles.timeText}>
                            {formatLastMessageTime(item.lastMessage?.createdAt || item.createdAt)}
                        </Text>
                    </View>

                    <View style={styles.lastMessageContainer}>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                            {item.lastMessage?.content || 'No hay mensajes'}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Cargando conversaciones...</Text>
            </View>
        );
    }

    if (conversations.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No tienes conversaciones</Text>
                <Text style={styles.emptyText}>
                    Comienza una nueva conversación buscando usuarios
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item, index) => item?.id || `conversation-${index}`}
            style={styles.container}
            showsVerticalScrollIndicator={false}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 16,
        color: '#666666',
        textAlign: 'center',
        lineHeight: 22,
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatarContainer: {
        marginRight: 12,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    conversationInfo: {
        flex: 1,
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    conversationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        flex: 1,
    },
    timeText: {
        fontSize: 12,
        color: '#999999',
    },
    lastMessageContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: 14,
        color: '#666666',
        flex: 1,
    },
});