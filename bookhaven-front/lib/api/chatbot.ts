import { API_CONFIG, APIResponse } from './config';

export interface PredefinedQuestion {
    id: string;
    question: string;
    category: string;
}

export interface ChatbotRequest {
    bookTitle: string;
    bookAuthor: string;
    bookDescription: string;
    question: string;
    isCustomQuestion?: boolean;
}

export interface ChatbotResponse {
    question: string;
    answer: string;
    bookTitle: string;
    bookAuthor: string;
    isCustomQuestion: boolean;
}

/**
 * Obtiene las preguntas predeterminadas del chatbot
 */
export const getPredefinedQuestions = async (): Promise<PredefinedQuestion[]> => {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHATBOT}`, {
            method: 'GET',
            headers: API_CONFIG.HEADERS,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: APIResponse<{ predefinedQuestions: PredefinedQuestion[] }> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Error al obtener las preguntas predeterminadas');
        }

        return data.data.predefinedQuestions;
    } catch (error) {
        console.error('Error getting predefined questions:', error);
        throw error;
    }
};

/**
 * Envía una pregunta al chatbot y obtiene la respuesta
 */
export const askChatbotQuestion = async (request: ChatbotRequest): Promise<ChatbotResponse> => {
    try {
        if (!request.bookTitle || !request.question) {
            throw new Error('Título del libro y pregunta son obligatorios');
        }

        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHATBOT}`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const data: APIResponse<ChatbotResponse> = await response.json();

        if (!data.success || !data.data) {
            throw new Error(data.error || 'Error al procesar la pregunta');
        }

        return data.data;
    } catch (error) {
        console.error('Error asking chatbot question:', error);
        throw error;
    }
};

/**
 * Valida si la configuración del chatbot está disponible
 */
export const validateChatbotAvailability = async (): Promise<boolean> => {
    try {
        await getPredefinedQuestions();
        return true;
    } catch (error) {
        console.error('Chatbot not available:', error);
        return false;
    }
};

/**
 * Función de utilidad para formatear errores del chatbot
 */
export const formatChatbotError = (error: any): string => {
    if (typeof error === 'string') {
        return error;
    }

    if (error?.message) {
        return error.message;
    }

    // Errores específicos comunes
    if (error?.status === 429) {
        return 'Límite de uso alcanzado. Intenta de nuevo más tarde.';
    }

    if (error?.status === 500) {
        return 'Error interno del servidor. Intenta de nuevo más tarde.';
    }

    if (error?.status === 400) {
        return 'Solicitud inválida. Verifica la información proporcionada.';
    }

    return 'Error de conexión. Verifica tu conexión a internet.';
};

// Constantes para límites y configuración
export const CHATBOT_CONFIG = {
    MAX_QUESTION_LENGTH: 500,
    MAX_CHAT_MESSAGES: 50,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // ms
};