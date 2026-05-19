import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import {
    getPredefinedQuestions,
    askChatbotQuestion,
    formatChatbotError,
    PredefinedQuestion,
    ChatbotRequest
} from '@/lib/api/chatbot';

interface ChatMessage {
    id: string;
    type: 'question' | 'answer';
    content: string;
    timestamp: Date;
}

interface Book {
    id: string;
    title: string;
    authors: string;
    description?: string;
}

interface ChatbotModalProps {
    visible: boolean;
    onClose: () => void;
    book: Book;
}

const ChatbotModal: React.FC<ChatbotModalProps> = ({ visible, onClose, book }) => {
    const [predefinedQuestions, setPredefinedQuestions] = useState<PredefinedQuestion[]>([]);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [customQuestion, setCustomQuestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);

    const theme = Colors['light'];
    const { width: screenWidth } = Dimensions.get('window');

    // Cargar preguntas predeterminadas al abrir la modal
    useEffect(() => {
        if (visible) {
            loadPredefinedQuestions();
            setChatMessages([]);
            setCustomQuestion('');
            setShowCustomInput(false);
        }
    }, [visible]);

    const loadPredefinedQuestions = async () => {
        setIsLoadingQuestions(true);
        try {
            const questions = await getPredefinedQuestions();
            setPredefinedQuestions(questions);
        } catch (error) {
            console.error('Error loading predefined questions:', error);
            Alert.alert('Error', formatChatbotError(error));
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const askQuestion = async (question: string, isCustom = false) => {
        if (!question.trim()) return;

        // Agregar la pregunta al chat
        const questionMessage: ChatMessage = {
            id: `q_${Date.now()}`,
            type: 'question',
            content: question,
            timestamp: new Date(),
        };

        setChatMessages(prev => [...prev, questionMessage]);
        setIsLoading(true);

        try {
            const request: ChatbotRequest = {
                bookTitle: book.title,
                bookAuthor: book.authors,
                bookDescription: book.description || '',
                question: question,
                isCustomQuestion: isCustom,
            };

            const response = await askChatbotQuestion(request);

            const answerMessage: ChatMessage = {
                id: `a_${Date.now()}`,
                type: 'answer',
                content: response.answer,
                timestamp: new Date(),
            };

            setChatMessages(prev => [...prev, answerMessage]);
        } catch (error) {
            console.error('Error asking question:', error);
            Alert.alert('Error', formatChatbotError(error));
        } finally {
            setIsLoading(false);
            setCustomQuestion('');
            setShowCustomInput(false);
        }
    };

    const handleCustomQuestion = () => {
        if (customQuestion.trim()) {
            askQuestion(customQuestion, true);
            // Limpiar el texto inmediatamente después de enviar
            setCustomQuestion('');
            setShowCustomInput(false);
        }
    };

    const renderMessage = (message: ChatMessage) => {
        const isQuestion = message.type === 'question';

        return (
            <View
                key={message.id}
                style={[
                    styles.messageContainer,
                    isQuestion ? styles.questionContainer : styles.answerContainer,
                ]}
            >
                <View
                    style={[
                        styles.messageBubble,
                        isQuestion
                            ? [styles.questionBubble, { backgroundColor: theme.tint }]
                            : [styles.answerBubble, { backgroundColor: theme.card }],
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            { color: isQuestion ? '#FFFFFF' : theme.text },
                        ]}
                    >
                        {message.content}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Header */}
                <View style={[styles.header, { backgroundColor: theme.card }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            💬 Asistente Literario
                        </Text>
                        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                            {book.title}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.robotIcon}
                        onPress={() => setChatMessages([])}
                    >
                        <Ionicons name="refresh" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Welcome Message */}
                    {chatMessages.length === 0 && (
                        <View style={[styles.welcomeContainer, { backgroundColor: theme.card }]}>
                            <Ionicons name="sparkles" size={32} color={theme.tint} />
                            <Text style={[styles.welcomeTitle, { color: theme.text }]}>
                                ¡Hola! Soy tu asistente literario
                            </Text>
                            <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
                                Puedes preguntarme cualquier cosa sobre "{book.title}".
                                Selecciona una pregunta predeterminada o escribe la tuya propia.
                            </Text>
                        </View>
                    )}

                    {/* Predefined Questions */}
                    {chatMessages.length === 0 && (
                        <View style={styles.questionsSection}>
                            <Text style={[styles.sectionTitle, { color: theme.text }]}>
                                🤔 Preguntas sugeridas
                            </Text>

                            {isLoadingQuestions ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="small" color={theme.tint} />
                                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                        Cargando preguntas...
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.questionsGrid}>
                                    {predefinedQuestions.map((item) => (
                                        <TouchableOpacity
                                            key={item.id}
                                            style={[styles.questionButton, { backgroundColor: theme.card }]}
                                            onPress={() => askQuestion(item.question)}
                                            disabled={isLoading}
                                        >
                                            <Text style={[styles.questionCategory, { color: theme.tint }]}>
                                                {item.category}
                                            </Text>
                                            <Text style={[styles.questionText, { color: theme.text }]} numberOfLines={2}>
                                                {item.question}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Chat Messages */}
                    {chatMessages.length > 0 && (
                        <View style={styles.chatContainer}>
                            {chatMessages.map(renderMessage)}

                            {isLoading && (
                                <View style={styles.loadingMessage}>
                                    <ActivityIndicator size="small" color={theme.tint} />
                                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                                        Pensando...
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>

                {/* Custom Question Input */}
                <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
                    {!showCustomInput ? (
                        <TouchableOpacity
                            style={[styles.showInputButton, { backgroundColor: theme.backgroundTertiary }]}
                            onPress={() => setShowCustomInput(true)}
                        >
                            <Ionicons name="chatbubble-outline" size={20} color={theme.text} />
                            <Text style={[styles.showInputText, { color: theme.text }]}>
                                Hacer pregunta personalizada
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.customInputRow}>
                            <TextInput
                                style={[
                                    styles.textInput,
                                    {
                                        backgroundColor: theme.backgroundTertiary,
                                        color: theme.text,
                                        borderColor: theme.border,
                                    }
                                ]}
                                placeholder="Escribe tu pregunta sobre el libro..."
                                placeholderTextColor={theme.textSecondary}
                                value={customQuestion}
                                onChangeText={setCustomQuestion}
                                multiline
                                maxLength={500}
                                autoFocus
                            />
                            <View style={styles.inputButtons}>
                                <TouchableOpacity
                                    style={[styles.inputButton, { backgroundColor: theme.tint }]}
                                    onPress={handleCustomQuestion}
                                    disabled={!customQuestion.trim() || isLoading}
                                >
                                    <Ionicons name="send" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.inputButton, { backgroundColor: theme.textSecondary }]}
                                    onPress={() => {
                                        setShowCustomInput(false);
                                        setCustomQuestion('');
                                    }}
                                >
                                    <Ionicons name="close" size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFF0',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        paddingTop: 52,
        backgroundColor: '#8B4513',
        borderBottomWidth: 0,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        marginLeft: 14,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
        color: 'rgba(255,255,255,0.75)',
    },
    robotIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFF0',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    welcomeContainer: {
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#FFF8F0',
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.12)',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8,
        textAlign: 'center',
        color: '#2F1B14',
        letterSpacing: 0.2,
    },
    welcomeText: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        color: '#5D4037',
    },
    questionsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 14,
        color: '#8B4513',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#8D6E63',
    },
    questionsGrid: {
        gap: 10,
    },
    questionButton: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#FFF8F0',
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.12)',
        borderLeftWidth: 4,
        borderLeftColor: '#8B4513',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    questionCategory: {
        fontSize: 11,
        fontWeight: '700',
        marginBottom: 5,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: '#DAA520',
    },
    questionText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#2F1B14',
    },
    chatContainer: {
        gap: 14,
    },
    messageContainer: {
        maxWidth: '85%',
    },
    questionContainer: {
        alignSelf: 'flex-end',
    },
    answerContainer: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: 14,
        borderRadius: 20,
    },
    questionBubble: {
        borderBottomRightRadius: 6,
        backgroundColor: '#8B4513',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    answerBubble: {
        borderBottomLeftRadius: 6,
        backgroundColor: '#FFF8F0',
        borderWidth: 1,
        borderColor: 'rgba(139, 69, 19, 0.1)',
        shadowColor: '#8B4513',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
    },
    messageText: {
        fontSize: 14,
        lineHeight: 21,
    },
    loadingMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        padding: 12,
        gap: 8,
    },
    inputContainer: {
        padding: 14,
        borderTopWidth: 1,
        borderTopColor: 'rgba(139, 69, 19, 0.1)',
        backgroundColor: '#FFF8F0',
    },
    showInputButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 24,
        gap: 8,
        backgroundColor: '#F0E8E0',
        borderWidth: 1.5,
        borderColor: 'rgba(139, 69, 19, 0.2)',
    },
    showInputText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#8B4513',
    },
    customInputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    textInput: {
        flex: 1,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        maxHeight: 120,
        minHeight: 48,
        backgroundColor: '#FFFFF0',
        borderColor: 'rgba(139, 69, 19, 0.25)',
    },
    inputButtons: {
        flexDirection: 'row',
        gap: 6,
    },
    inputButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
});

export default ChatbotModal;