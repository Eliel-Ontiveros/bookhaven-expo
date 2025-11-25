import { API_CONFIG, type APIResponse } from './config';

export interface ChatUser {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
}

export interface Conversation {
    id: string;
    name?: string;
    isGroup: boolean;
    createdAt: string;
    updatedAt: string;
    participants: ChatUser[];
    lastMessage?: Message;
}

export interface Message {
    id: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'BOOK_RECOMMENDATION' | 'VOICE_NOTE';
    senderId: string;
    conversationId: string;
    createdAt: string;
    sender: ChatUser;

    // Campos para notas de voz
    audioUrl?: string;
    audioDuration?: number;
    audioSize?: number;
    transcription?: string;

    // Campos para imágenes
    imageUrl?: string;
    imageWidth?: number;
    imageHeight?: number;
}

export interface ConversationInfo {
    id: number;
    name?: string;
    isGroup: boolean;
    createdAt: string;
    participants: Array<{
        id: number;
        username: string;
        bio?: string;
        joinedAt: string;
        isCurrentUser: boolean;
    }>;
    otherParticipant?: {
        id: number;
        username: string;
        bio?: string;
    } | null;
}

export class ChatService {
    private static getAuthHeaders(token: string) {
        return {
            ...API_CONFIG.HEADERS,
            'Authorization': `Bearer ${token}`,
        };
    }

    static async searchUsers(query: string, token: string): Promise<ChatUser[]> {
        try {
            console.log('🔍 ChatService.searchUsers - Query:', query);
            console.log('🔍 ChatService.searchUsers - Token:', token ? 'Present' : 'Missing');

            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_USER_SEARCH}?q=${encodeURIComponent(query)}`;
            console.log('🔍 ChatService.searchUsers - URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            });

            console.log('🔍 ChatService.searchUsers - Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ ChatService.searchUsers - Error response:', errorText);
                throw new Error(`Error searching users: ${response.status}`);
            }

            const data: APIResponse<ChatUser[]> = await response.json();
            console.log('✅ ChatService.searchUsers - Success:', data);

            // La API devuelve los usuarios en data.users con IDs como number
            const rawUsers = (data as any).users || data.data || [];
            console.log('📦 Raw users from API:', rawUsers);

            // Convertir IDs de number a string para compatibilidad
            const users: ChatUser[] = rawUsers.map((user: any) => ({
                id: user.id.toString(),
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl
            }));

            console.log('🔄 Converted users:', users);
            return users;
        } catch (error) {
            console.error('❌ ChatService.searchUsers - Error:', error);
            throw error;
        }
    }

    static async getConversations(token: string): Promise<Conversation[]> {
        try {
            console.log('💬 ChatService.getConversations - Token:', token ? 'Present' : 'Missing');

            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS}`;
            console.log('💬 ChatService.getConversations - URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            });

            console.log('💬 ChatService.getConversations - Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ ChatService.getConversations - Error response:', errorText);
                throw new Error(`Error fetching conversations: ${response.status}`);
            }

            const rawConversations = await response.json();
            console.log('✅ ChatService.getConversations - Raw data:', rawConversations);

            // Obtener el userId actual del token
            const tokenPayload = JSON.parse(atob(token.split('.')[1]));
            const currentUserId = tokenPayload.userId;
            console.log('👤 Current user ID:', currentUserId);

            // Transformar las conversaciones para mostrar el nombre correcto
            const conversations: Conversation[] = rawConversations.map((conv: any) => {
                // Encontrar el otro participante (no el usuario actual)
                const otherParticipant = conv.participants?.find((p: any) =>
                    p.userId !== currentUserId
                );

                const conversationName = conv.isGroup
                    ? conv.name || 'Chat grupal'
                    : otherParticipant?.user?.username || 'Usuario desconocido';

                const lastMessage = conv.messages?.[0];

                return {
                    id: conv.id.toString(),
                    name: conversationName,
                    isGroup: conv.isGroup || false,
                    createdAt: conv.createdAt,
                    updatedAt: conv.updatedAt,
                    participants: conv.participants?.map((p: any) => ({
                        id: p.user.id.toString(),
                        username: p.user.username,
                        email: p.user.email,
                        avatarUrl: p.user.profile?.avatarUrl || null
                    })) || [],
                    lastMessage: lastMessage ? {
                        id: lastMessage.id.toString(),
                        content: lastMessage.content,
                        senderId: lastMessage.senderId.toString(),
                        conversationId: lastMessage.conversationId.toString(),
                        messageType: lastMessage.messageType,
                        createdAt: lastMessage.createdAt,
                        sender: {
                            id: lastMessage.sender?.id?.toString() || '0',
                            username: lastMessage.sender?.username || 'Usuario',
                            email: '',
                            avatarUrl: null
                        }
                    } : undefined
                };
            });

            console.log('🔄 Transformed conversations:', conversations);
            return conversations;
        } catch (error) {
            console.error('❌ ChatService.getConversations - Error:', error);
            throw error;
        }
    }

    static async createConversation(participantIds: string[], isGroup: boolean, name?: string, token?: string): Promise<Conversation> {
        try {
            console.log('➕ ChatService.createConversation - Participants:', participantIds);

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_CONVERSATIONS}`, {
                method: 'POST',
                headers: this.getAuthHeaders(token || ''),
                body: JSON.stringify({
                    participantIds,
                    isGroup,
                    name,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error creating conversation: ${response.status}`);
            }

            const conversation = await response.json();
            console.log('✅ ChatService.createConversation - Success:', conversation);

            // El backend devuelve la conversación directamente, no envuelta en data
            return conversation;
        } catch (error) {
            console.error('❌ ChatService.createConversation - Error:', error);
            throw error;
        }
    }

    static async getMessages(conversationId: string, token: string): Promise<Message[]> {
        try {
            console.log('📨 ChatService.getMessages - ConversationId:', conversationId);

            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_MESSAGES}/${conversationId}`;
            console.log('📨 ChatService.getMessages - URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            });

            console.log('📨 ChatService.getMessages - Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ ChatService.getMessages - Error response:', errorText);
                throw new Error(`Error fetching messages: ${response.status}`);
            }

            const data: any = await response.json();
            console.log('✅ ChatService.getMessages - Success:', data);

            // El backend devuelve { messages: [...] }
            const rawMessages = data.messages || data.data || [];
            console.log('📦 Raw messages from API:', rawMessages);

            // Convertir IDs de number a string para compatibilidad y validar estructura
            const messages: Message[] = rawMessages
                .filter((msg: any) => msg && msg.id) // Filtrar mensajes inválidos
                .map((msg: any) => ({
                    id: msg.id.toString(),
                    content: msg.content,
                    senderId: msg.senderId.toString(),
                    conversationId: msg.conversationId.toString(),
                    messageType: msg.messageType,
                    createdAt: msg.createdAt,
                    sender: {
                        id: msg.sender?.id?.toString() || '0',
                        username: msg.sender?.username || 'Usuario desconocido',
                        email: msg.sender?.email || '',
                        avatarUrl: msg.sender?.avatarUrl || null
                    },
                    // Campos específicos para notas de voz
                    audioUrl: msg.audioUrl || undefined,
                    audioDuration: msg.audioDuration || undefined,
                    audioSize: msg.audioSize || undefined,
                    transcription: msg.transcription || undefined,
                    // Campos específicos para imágenes
                    imageUrl: msg.imageUrl || undefined,
                    imageWidth: msg.imageWidth || undefined,
                    imageHeight: msg.imageHeight || undefined
                }));

            console.log('🔄 Converted messages:', messages);
            return messages;
        } catch (error) {
            console.error('❌ ChatService.getMessages - Error:', error);
            throw error;
        }
    }

    static async sendMessage(conversationId: string, content: string, messageType: 'TEXT' | 'IMAGE' | 'BOOK_RECOMMENDATION', token: string): Promise<Message> {
        try {
            console.log('📤 ChatService.sendMessage - ConversationId:', conversationId, 'Content:', content);

            const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_MESSAGES}/${conversationId}`, {
                method: 'POST',
                headers: this.getAuthHeaders(token),
                body: JSON.stringify({
                    content,
                    messageType,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error sending message: ${response.status}`);
            }

            const data: any = await response.json();
            console.log('✅ ChatService.sendMessage - Success:', data);

            // El backend devuelve el mensaje directamente o en { message: {...} }
            const rawMessage = data.message || data;
            console.log('📦 Raw message from API:', rawMessage);

            // Convertir IDs y validar estructura
            const message: Message = {
                id: rawMessage.id.toString(),
                content: rawMessage.content,
                senderId: rawMessage.senderId.toString(),
                conversationId: rawMessage.conversationId.toString(),
                messageType: rawMessage.messageType,
                createdAt: rawMessage.createdAt,
                sender: {
                    id: rawMessage.sender?.id?.toString() || rawMessage.senderId.toString(),
                    username: rawMessage.sender?.username || 'Tu',
                    email: rawMessage.sender?.email || '',
                    avatarUrl: rawMessage.sender?.avatarUrl || null
                },
                // Campos específicos para notas de voz
                audioUrl: rawMessage.audioUrl || undefined,
                audioDuration: rawMessage.audioDuration || undefined,
                audioSize: rawMessage.audioSize || undefined,
                transcription: rawMessage.transcription || undefined
            };

            console.log('🔄 Converted message:', message);
            return message;
        } catch (error) {
            console.error('❌ ChatService.sendMessage - Error:', error);
            throw error;
        }
    }

    static async getConversationInfo(conversationId: string, token: string): Promise<ConversationInfo> {
        try {
            console.log('ℹ️ ChatService.getConversationInfo - ConversationId:', conversationId);
            console.log('ℹ️ ChatService.getConversationInfo - Token:', token ? 'Present' : 'Missing');

            const url = `${API_CONFIG.BASE_URL}/api/chat/conversations/${conversationId}/info`;
            console.log('ℹ️ ChatService.getConversationInfo - URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(token),
            });

            console.log('ℹ️ ChatService.getConversationInfo - Response status:', response.status);

            if (!response.ok) {
                throw new Error(`Error getting conversation info: ${response.status}`);
            }

            const data: APIResponse<ConversationInfo> = await response.json();
            console.log('✅ ChatService.getConversationInfo - Success:', data);

            if (!data.success || !data.data) {
                throw new Error('Invalid response format');
            }

            return data.data;
        } catch (error) {
            console.error('❌ ChatService.getConversationInfo - Error:', error);
            throw error;
        }
    }
}