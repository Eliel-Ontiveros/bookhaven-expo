import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PREDEFINED_QUESTIONS } from '@/lib/chatbot/constants';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('⚠️ OPENAI_API_KEY no está configurada en las variables de entorno');
}

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY || '',
});

interface ChatbotRequest {
    bookTitle: string;
    bookAuthor: string;
    bookDescription: string;
    question: string;
    isCustomQuestion?: boolean;
}

export async function GET(req: NextRequest) {
    try {
        console.log('🤖 Chatbot GET request received');
        return NextResponse.json({
            success: true,
            data: {
                predefinedQuestions: PREDEFINED_QUESTIONS
            }
        });
    } catch (error) {
        console.error('Error getting predefined questions:', error);
        return NextResponse.json({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    let bookTitle = '';
    let bookAuthor = '';
    let bookDescription = '';
    let question = '';
    let isCustomQuestion = false;

    try {
        console.log('🤖 Chatbot POST request received');

        const body: ChatbotRequest = await req.json();
        bookTitle = body.bookTitle;
        bookAuthor = body.bookAuthor;
        bookDescription = body.bookDescription;
        question = body.question;
        isCustomQuestion = body.isCustomQuestion || false;

        if (!bookTitle || !question) {
            return NextResponse.json({
                success: false,
                error: 'Título del libro y pregunta son obligatorios'
            }, { status: 400 });
        }

        // Verificar si OpenAI está configurado
        if (!OPENAI_API_KEY) {
            console.log('⚠️ OpenAI API no configurada, devolviendo respuesta mock');
            const mockAnswer = `Esta es una respuesta de prueba para la pregunta: "${question}" sobre el libro "${bookTitle}" de ${bookAuthor}. 

Para obtener respuestas reales de IA, configura tu OPENAI_API_KEY en el archivo .env del backend.

Descripción del libro: ${bookDescription || 'No disponible'}`;

            return NextResponse.json({
                success: true,
                data: {
                    question,
                    answer: mockAnswer,
                    bookTitle,
                    bookAuthor,
                    isCustomQuestion: isCustomQuestion || false
                }
            });
        }

        const prompt = `Responde de forma CONCISA y DIRECTA sobre el libro "${bookTitle}" de ${bookAuthor}.

Información del libro:
- Título: "${bookTitle}"
- Autor: "${bookAuthor || 'No especificado'}"
- Descripción: ${bookDescription || 'No disponible'}

Pregunta: ${question}

INSTRUCCIONES:
- Responde SOLO lo que se pregunta, sin información extra
- Sé específico y directo
- Mínimo 2-3 párrafos cortos
- Máximo 4-6 párrafos cortos
- Si la pregunta es muy amplia, enfócate en lo más relevante
- Si vas a listar puntos, divide en párrafos cortos cada uno
- NO inventes información si no la conoces
- Si no conoces el libro específico, dilo claramente
- NO uses asteriscos, guiones ni símbolos especiales
- Texto natural y fluido
- Responde en español

Respuesta concisa y directa:`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Eres un experto en literatura que responde de forma CONCISA y DIRECTA. NO te extiendas innecesariamente. Responde solo lo que se pregunta, máximo 2-3 párrafos cortos. NO inventes información. Usa texto natural sin asteriscos ni símbolos especiales. Responde en español."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 400,
            temperature: 0.7,
        });

        const answer = completion.choices[0]?.message?.content || 'No se pudo generar una respuesta.';

        return NextResponse.json({
            success: true,
            data: {
                question,
                answer,
                bookTitle,
                bookAuthor,
                isCustomQuestion: isCustomQuestion || false
            }
        });

    } catch (error) {
        console.error('Error in chatbot API:', error);

        // Manejar errores específicos de la API de OpenAI
        if (error instanceof Error) {
            if (error.message.includes('API_KEY') || error.message.includes('API key') || error.message.includes('Unauthorized')) {
                return NextResponse.json({
                    success: false,
                    error: 'Error de configuración de API de OpenAI'
                }, { status: 500 });
            }

            if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('rate')) {
                return NextResponse.json({
                    success: false,
                    error: 'Límite de uso de API alcanzado. Intenta de nuevo más tarde.'
                }, { status: 429 });
            }

            if (error.message.includes('content_filter') || error.message.includes('moderation')) {
                return NextResponse.json({
                    success: false,
                    error: 'La pregunta no pudo ser procesada por políticas de contenido.'
                }, { status: 400 });
            }

            if (error.message.includes('model') || error.message.includes('engine')) {
                return NextResponse.json({
                    success: false,
                    error: 'Error en el modelo de IA. Intenta de nuevo más tarde.'
                }, { status: 500 });
            }
        }

        // Fallback a respuesta mock en caso de error
        console.log('🔄 Error con OpenAI, devolviendo respuesta mock');
        const fallbackAnswer = `Lo siento, no pude procesar tu pregunta sobre "${bookTitle || 'este libro'}" de ${bookAuthor || 'este autor'} en este momento debido a un error temporal. 

Pregunta: ${question || 'pregunta no disponible'}

Por favor, intenta de nuevo más tarde. Si el problema persiste, verifica la configuración de la API de OpenAI.`;

        return NextResponse.json({
            success: true,
            data: {
                question: question || '',
                answer: fallbackAnswer,
                bookTitle: bookTitle || '',
                bookAuthor: bookAuthor || '',
                isCustomQuestion: isCustomQuestion || false
            }
        });
    }
}