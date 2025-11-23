import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    StatusBar
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import ChatScreen from '../../components/ChatScreen';
import { useAuth } from '../../contexts/AuthContext';
import { ChatService, type Message } from '../../lib/api/chat';

export default function ConversationScreen() {
    const router = useRouter();
    const { conversationId, conversationName } = useLocalSearchParams<{
        conversationId: string;
        conversationName: string;
    }>();
    const { user, token } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);

    useEffect(() => {
        if (user && token && conversationId) {
            loadMessages();
            const cleanup = initializeSocket();
            return cleanup;
        }
    }, [user, token, conversationId]);

    const initializeSocket = () => {
        // Fallback sin Socket.IO - usar polling
        console.log('Modo de polling activado para mensajes');

        // Polling cada 3 segundos para nuevos mensajes
        const pollInterval = setInterval(async () => {
            if (token && conversationId) {
                try {
                    const newMessages = await ChatService.getMessages(conversationId, token);
                    const validMessages = Array.isArray(newMessages) ? newMessages.filter(Boolean) : [];

                    // Solo actualizar si hay mensajes nuevos
                    setMessages(prev => {
                        if (prev.length !== validMessages.length) {
                            return validMessages;
                        }
                        return prev;
                    });
                } catch (error) {
                    console.log('Error en polling:', error);
                }
            }
        }, 3000);

        // Limpiar interval al desmontar
        return () => clearInterval(pollInterval);
    };

    const loadMessages = async () => {
        if (!token || !conversationId) return;

        try {
            const messagesData = await ChatService.getMessages(conversationId, token);
            // Asegurarse de que sea un array válido
            setMessages(Array.isArray(messagesData) ? messagesData.filter(Boolean) : []);
        } catch (error: any) {
            if (error?.message?.includes('403')) {
                Alert.alert('Error', 'No tienes acceso a esta conversación');
                router.back();
            } else {
                Alert.alert('Error', 'No se pudieron cargar los mensajes');
            }
            console.error('Error loading messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (content: string) => {
        if (!token || !conversationId) {
            throw new Error('No hay conexión disponible');
        }

        try {
            const newMessage = await ChatService.sendMessage(conversationId, content, 'TEXT', token);
            // Agregar el mensaje inmediatamente si es válido
            if (newMessage && newMessage.id) {
                setMessages(prev => [...prev, newMessage]);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const handleTypingStart = () => {
        // Deshabilitado por ahora (sin Socket.IO)
        console.log('Typing start (disabled)');
    };

    const handleTypingStop = () => {
        // Deshabilitado por ahora (sin Socket.IO)
        console.log('Typing stop (disabled)');
    };

    if (!user || !conversationId) {
        return null;
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

            <Stack.Screen
                options={{
                    title: conversationName || 'Chat',
                    headerBackTitle: 'Volver',
                }}
            />

            <ChatScreen
                conversationId={conversationId}
                conversationName={conversationName || 'Chat'}
                currentUserId={user.id.toString()}
                onSendMessage={sendMessage}
                messages={messages}
                loading={loading}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
                typingUsers={typingUsers}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
});