import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Message } from '../lib/api/chat';

interface ChatScreenProps {
    conversationId: string;
    conversationName: string;
    currentUserId: string;
    onSendMessage: (content: string) => Promise<void>;
    messages: Message[];
    loading?: boolean;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    typingUsers?: string[];
}

export default function ChatScreen({
    conversationId,
    conversationName,
    currentUserId,
    onSendMessage,
    messages,
    loading = false,
    onTypingStart,
    onTypingStop,
    typingUsers = []
}: ChatScreenProps) {
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<any>(null);

    useEffect(() => {
        // Scroll al final cuando lleguen nuevos mensajes
        if (messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    const handleSendMessage = async () => {
        if (inputText.trim() === '' || sending) return;

        const messageContent = inputText.trim();
        setInputText('');
        setSending(true);

        try {
            await onSendMessage(messageContent);
            onTypingStop?.();
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar el mensaje');
            setInputText(messageContent); // Restaurar el texto
        } finally {
            setSending(false);
        }
    };

    const handleInputChange = (text: string) => {
        setInputText(text);

        // Manejar indicador de escritura
        if (text.trim() && !typingTimeoutRef.current) {
            onTypingStart?.();
        }

        // Limpiar el timeout anterior
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Configurar nuevo timeout
        typingTimeoutRef.current = setTimeout(() => {
            onTypingStop?.();
            typingTimeoutRef.current = null;
        }, 1000);
    };

    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);

        if (isToday(date)) {
            return format(date, 'HH:mm');
        } else if (isYesterday(date)) {
            return `Ayer ${format(date, 'HH:mm')}`;
        } else {
            return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
        }
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
        if (!item) return null;

        const isOwnMessage = item.senderId === currentUserId;
        const previousMessage = index > 0 ? messages[index - 1] : null;
        const showSenderName = !isOwnMessage &&
            (!previousMessage || previousMessage.senderId !== item.senderId);

        return (
            <View style={[
                styles.messageContainer,
                isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
            ]}>
                {showSenderName && (
                    <Text style={styles.senderName}>{item.sender?.username || 'Usuario'}</Text>
                )}
                <View style={[
                    styles.messageBubble,
                    isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
                ]}>
                    <Text style={[
                        styles.messageText,
                        isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                    ]}>
                        {item.content}
                    </Text>
                    <Text style={[
                        styles.timeText,
                        isOwnMessage ? styles.ownTimeText : styles.otherTimeText
                    ]}>
                        {formatMessageTime(item.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    const renderTypingIndicator = () => {
        if (typingUsers.length === 0) return null;

        return (
            <View style={styles.typingContainer}>
                <Text style={styles.typingText}>
                    {typingUsers.length === 1
                        ? `${typingUsers[0]} está escribiendo...`
                        : `${typingUsers.length} usuarios están escribiendo...`
                    }
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Lista de mensajes */}
            <FlatList
                ref={flatListRef}
                data={messages.filter(Boolean)}
                renderItem={renderMessage}
                keyExtractor={(item, index) => item?.id?.toString() || `message-${index}`}
                style={styles.messagesList}
                showsVerticalScrollIndicator={false}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            />

            {/* Indicador de escritura */}
            {renderTypingIndicator()}

            {/* Input de mensaje */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={inputText}
                    onChangeText={handleInputChange}
                    placeholder="Escribe un mensaje..."
                    multiline
                    maxLength={1000}
                    editable={!sending}
                />
                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { opacity: (inputText.trim() === '' || sending) ? 0.5 : 1 }
                    ]}
                    onPress={handleSendMessage}
                    disabled={inputText.trim() === '' || sending}
                >
                    <Ionicons
                        name="send"
                        size={20}
                        color="#ffffff"
                    />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    messagesList: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    messageContainer: {
        marginVertical: 2,
    },
    ownMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    senderName: {
        fontSize: 12,
        color: '#666666',
        marginBottom: 4,
        marginLeft: 8,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 18,
        marginBottom: 8,
    },
    ownMessageBubble: {
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 6,
    },
    otherMessageBubble: {
        backgroundColor: '#ffffff',
        borderBottomLeftRadius: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 16,
        lineHeight: 20,
        marginBottom: 4,
    },
    ownMessageText: {
        color: '#ffffff',
    },
    otherMessageText: {
        color: '#333333',
    },
    timeText: {
        fontSize: 11,
        alignSelf: 'flex-end',
    },
    ownTimeText: {
        color: 'rgba(255, 255, 255, 0.7)',
    },
    otherTimeText: {
        color: '#999999',
    },
    typingContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    typingText: {
        fontSize: 14,
        color: '#666666',
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        maxHeight: 100,
        marginRight: 12,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
});