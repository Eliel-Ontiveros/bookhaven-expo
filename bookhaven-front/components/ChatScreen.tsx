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
    Alert,
    Image,
    StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { format, isToday, isYesterday } from 'date-fns';
import { es } from 'date-fns/locale';
import { type Message } from '../lib/api/chat';
import BookListSelector from './BookListSelector';
import { Book } from '../lib/api/types';
import { Colors } from '../constants/theme';
import { useColorScheme } from '../hooks/use-color-scheme';
import Header from './Header';
import VoiceRecorder from './VoiceRecorder';
import VoicePlayer from './VoicePlayer';
import { VoiceNoteService } from '../lib/api/voiceNotes';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatScreenProps {
    conversationId: string;
    conversationName: string;
    currentUserId: string;
    onSendMessage: (content: string, messageType?: 'TEXT' | 'IMAGE' | 'BOOK_RECOMMENDATION' | 'VOICE_NOTE') => Promise<void>;
    messages: Message[];
    loading?: boolean;
    onTypingStart?: () => void;
    onTypingStop?: () => void;
    typingUsers?: string[];
    otherParticipant?: {
        id: number;
        username: string;
        bio?: string;
    } | null;
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
    typingUsers = [],
    otherParticipant
}: ChatScreenProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const [inputText, setInputText] = useState('');
    const [sending, setSending] = useState(false);
    const [showBookSelector, setShowBookSelector] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
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

    const handleBookSelect = async (book: Book) => {
        setShowBookSelector(false);
        setSending(true);

        // Haptic feedback para indicar acción exitosa
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Crear el contenido del mensaje con información del libro en formato JSON
            const bookMessage = JSON.stringify({
                title: book.title,
                author: book.authors,
                description: book.description,
                image: book.image,
                categories: book.categories,
                averageRating: book.averageRating,
                bookId: book.id
            });

            console.log('📚 Enviando libro compartido:', {
                title: book.title,
                author: book.authors,
                bookId: book.id
            });

            await onSendMessage(bookMessage, 'BOOK_RECOMMENDATION');
        } catch (error) {
            Alert.alert('Error', 'No se pudo compartir el libro');
        } finally {
            setSending(false);
        }
    };

    const handleShareBook = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowBookSelector(true);
    };

    const handleVoiceRecording = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setShowVoiceRecorder(true);
    };

    const handleVoiceRecordingComplete = async (audioUri: string, duration: number) => {
        setShowVoiceRecorder(false);
        setSending(true);

        try {
            // Haptic feedback para indicar inicio de subida
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Generar nombre único para el archivo
            const fileName = `voice-note-${Date.now()}.m4a`;

            console.log('🎙️ Subiendo nota de voz:', { fileName, duration });

            // Subir nota de voz a S3
            const uploadResult = await VoiceNoteService.uploadVoiceNote(audioUri, fileName, token);

            console.log('✅ Nota de voz subida:', uploadResult);

            // Enviar mensaje de voz
            await VoiceNoteService.sendVoiceMessage(
                conversationId,
                uploadResult.s3Key,
                duration,
                uploadResult.size,
                token
            );

            // Haptic feedback de éxito
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        } catch (error) {
            console.error('Error enviando nota de voz:', error);
            Alert.alert('Error', 'No se pudo enviar la nota de voz');

            // Haptic feedback de error
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setSending(false);
        }
    };

    const handleVoiceRecordingCancel = () => {
        setShowVoiceRecorder(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleViewUserProfile = () => {
        if (otherParticipant) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push({
                pathname: '/user-profile',
                params: {
                    userId: otherParticipant.id.toString(),
                    conversationId: conversationId,
                    conversationName: conversationName
                }
            });
        }
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

        const renderMessageContent = () => {
            if (item.messageType === 'VOICE_NOTE') {
                console.log('🎵 Rendering voice note:', {
                    audioUrl: item.audioUrl,
                    audioDuration: item.audioDuration,
                    audioSize: item.audioSize,
                    messageContent: item.content
                });

                return (
                    <VoicePlayer
                        audioUrl={item.audioUrl || ''}
                        audioDuration={item.audioDuration || 0}
                        audioSize={item.audioSize}
                        isOwnMessage={isOwnMessage}
                    />
                );
            }

            if (item.messageType === 'BOOK_RECOMMENDATION') {
                try {
                    const bookData = JSON.parse(item.content);
                    console.log('📖 Datos del libro parseados:', bookData);
                    return (
                        <TouchableOpacity
                            style={[
                                styles.bookRecommendationContainer,
                                isOwnMessage ? styles.ownBookRecommendation : styles.otherBookRecommendation
                            ]}
                            onPress={() => {
                                // Haptic feedback al tocar el libro
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                                // Crear el objeto book con la estructura esperada por book-detail
                                const bookObject = {
                                    id: bookData.bookId || Date.now().toString(),
                                    title: bookData.title || 'Libro compartido',
                                    authors: bookData.author || 'Autor desconocido',
                                    description: bookData.description || 'Descripción no disponible.',
                                    categories: bookData.categories || ['General'],
                                    averageRating: bookData.averageRating || 0,
                                    image: bookData.image
                                };

                                console.log('📖 Navegando a detalle del libro:', bookObject);

                                // Navegar al detalle del libro
                                router.push({
                                    pathname: '/book-detail',
                                    params: {
                                        book: JSON.stringify(bookObject)
                                    }
                                });
                            }}
                        >
                            <View style={styles.bookRecommendationHeader}>
                                <Ionicons
                                    name="book"
                                    size={20}
                                    color={isOwnMessage ? "#F5F5DC" : "#8B4513"}
                                />
                                <Text style={[
                                    styles.bookRecommendationLabel,
                                    { color: isOwnMessage ? "#F5F5DC" : "#8B4513" }
                                ]}>
                                    Libro recomendado
                                </Text>
                                <Ionicons
                                    name="chevron-forward"
                                    size={16}
                                    color={isOwnMessage ? "#D2B48C" : "#8B4513"}
                                    style={{ marginLeft: 'auto' }}
                                />
                            </View>

                            <View style={styles.bookInfo}>
                                {bookData.image && (
                                    <Image
                                        source={{ uri: bookData.image }}
                                        style={styles.bookImage}
                                        resizeMode="cover"
                                    />
                                )}
                                <View style={styles.bookDetails}>
                                    <Text style={[
                                        styles.bookTitle,
                                        { color: isOwnMessage ? "#F5F5DC" : "#2F1B14" }
                                    ]} numberOfLines={2}>
                                        {bookData.title}
                                    </Text>
                                    <Text style={[
                                        styles.bookAuthor,
                                        { color: isOwnMessage ? "#D2B48C" : "#5D4037" }
                                    ]} numberOfLines={1}>
                                        {bookData.author}
                                    </Text>
                                    {bookData.averageRating && (
                                        <View style={styles.ratingContainer}>
                                            <Ionicons
                                                name="star"
                                                size={14}
                                                color="#FFD700"
                                            />
                                            <Text style={[
                                                styles.ratingText,
                                                { color: isOwnMessage ? "#D2B48C" : "#5D4037" }
                                            ]}>
                                                {bookData.averageRating.toFixed(1)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                } catch (error) {
                    // Si no se puede parsear el JSON, mostrar como mensaje normal
                    return (
                        <Text style={[
                            styles.messageText,
                            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                        ]}>
                            {item.content}
                        </Text>
                    );
                }
            }

            // Mensaje de texto normal
            return (
                <Text style={[
                    styles.messageText,
                    isOwnMessage ? styles.ownMessageText : styles.otherMessageText
                ]}>
                    {item.content}
                </Text>
            );
        };

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
                    isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
                    item.messageType === 'BOOK_RECOMMENDATION' && styles.bookMessageBubble,
                    item.messageType === 'VOICE_NOTE' && styles.voiceMessageBubble
                ]}>
                    {renderMessageContent()}
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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Header principal con navegación al perfil */}
            <LinearGradient
                colors={theme.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.header, { paddingTop: insets.top + 15 }]}
            >
                <TouchableOpacity
                    style={styles.logoMainContainer}
                    onPress={() => router.back()}
                >
                    <View style={styles.logoCircle}>
                        <Ionicons name="arrow-back" size={15} color="#FFFFFF" />
                    </View>
                    <Text style={styles.logoMainText}>{conversationName}</Text>
                </TouchableOpacity>

                <View style={styles.navContainer}>
                    {otherParticipant && (
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleViewUserProfile}
                        >
                            <Ionicons name="person" size={20} color="rgba(255, 255, 255, 0.9)" />
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => router.push('/chat' as any)}
                    >
                        <Ionicons name="chatbubbles" size={20} color="rgba(255, 255, 255, 0.9)" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <KeyboardAvoidingView
                style={[styles.chatContainer, { backgroundColor: theme.background }]}
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
                        style={styles.shareButton}
                        onPress={handleShareBook}
                        disabled={sending}
                    >
                        <Ionicons
                            name="book"
                            size={20}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.voiceButton}
                        onPress={handleVoiceRecording}
                        disabled={sending}
                    >
                        <Ionicons
                            name="mic"
                            size={20}
                            color="#ffffff"
                        />
                    </TouchableOpacity>
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

                {/* Modal del selector de libros */}
                <BookListSelector
                    visible={showBookSelector}
                    onClose={() => setShowBookSelector(false)}
                    onBookSelect={handleBookSelect}
                />

                {/* Modal de grabación de voz */}
                {showVoiceRecorder && (
                    <View style={styles.voiceRecorderOverlay}>
                        <View style={styles.voiceRecorderContainer}>
                            <VoiceRecorder
                                onRecordingComplete={handleVoiceRecordingComplete}
                                onCancel={handleVoiceRecordingCancel}
                                disabled={sending}
                            />
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingBottom: 15,
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
    chatContainer: {
        flex: 1,
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
    shareButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DAA520', // Dorado elegante, perfecto para libros
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    voiceButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FF6B6B', // Rojo suave para notas de voz
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    bookMessageBubble: {
        padding: 0,
        overflow: 'hidden',
    },
    voiceMessageBubble: {
        padding: 0,
        overflow: 'hidden',
    },
    bookRecommendationContainer: {
        borderRadius: 18,
        overflow: 'hidden',
        minWidth: 200,
        maxWidth: '100%',
    },
    ownBookRecommendation: {
        backgroundColor: '#8B4513', // Marrón cuero, más elegante que azul
    },
    otherBookRecommendation: {
        backgroundColor: '#F7F3E9', // Papel envejecido
        borderWidth: 1,
        borderColor: '#D2B48C',
    },
    bookRecommendationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: 8,
    },
    bookRecommendationLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
        flex: 1,
    },
    bookInfo: {
        flexDirection: 'row',
        padding: 12,
        paddingTop: 0,
    },
    bookImage: {
        width: 60,
        height: 90,
        borderRadius: 8,
        marginRight: 12,
    },
    bookDetails: {
        flex: 1,
        justifyContent: 'space-between',
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 20,
    },
    bookAuthor: {
        fontSize: 14,
        marginBottom: 6,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '500',
    },
    voiceRecorderOverlay: {
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
    voiceRecorderContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 20,
        padding: 20,
        margin: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});