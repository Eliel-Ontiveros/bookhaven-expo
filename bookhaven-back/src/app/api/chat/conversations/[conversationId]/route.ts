import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MessageType } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { PushNotificationService } from '@/lib/notifications/push';

const prisma = new PrismaClient();

// GET - Obtener mensajes de una conversación
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const resolvedParams = await params;
        const conversationId = parseInt(resolvedParams.conversationId);

        // Verificar que el usuario es participante de la conversación
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId: decoded.userId,
                    conversationId: conversationId
                }
            }
        });

        if (!participant) {
            return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = (page - 1) * limit;

        const messages = await prisma.message.findMany({
            where: {
                conversationId: conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });

        // Marcar mensajes como leídos
        await prisma.conversationParticipant.update({
            where: {
                userId_conversationId: {
                    userId: decoded.userId,
                    conversationId: conversationId
                }
            },
            data: {
                lastReadAt: new Date()
            }
        });

        // Log de ejemplo de mensaje para debug
        if (messages.length > 0) {
            const sampleMessage = messages[0];
            console.log('📨 GET Messages - Sample message:', {
                id: sampleMessage.id,
                messageType: sampleMessage.messageType,
                hasImageUrl: !!sampleMessage.imageUrl,
                hasAudioUrl: !!sampleMessage.audioUrl,
                imageUrl: sampleMessage.imageUrl,
                imageWidth: sampleMessage.imageWidth,
                imageHeight: sampleMessage.imageHeight
            });
        }

        return NextResponse.json({
            messages: messages.reverse(),
            pagination: {
                page,
                limit,
                hasMore: messages.length === limit
            }
        });
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Enviar mensaje
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const resolvedParams = await params;
        const conversationId = parseInt(resolvedParams.conversationId);
        const {
            content,
            messageType = 'TEXT',
            audioUrl,
            audioDuration,
            audioSize,
            transcription,
            imageUrl,
            imageWidth,
            imageHeight
        } = await request.json();

        console.log('📨 POST Message - Received data:', {
            messageType,
            content: content?.substring(0, 50),
            audioUrl,
            imageUrl,
            imageWidth,
            imageHeight
        });

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'El contenido del mensaje es requerido' }, { status: 400 });
        }

        // Verificar que el usuario es participante de la conversación
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId: decoded.userId,
                    conversationId: conversationId
                }
            }
        });

        if (!participant) {
            return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 });
        }

        // Crear el mensaje con campos opcionales para notas de voz
        const messageData: any = {
            content: content.trim(),
            senderId: decoded.userId,
            conversationId: conversationId,
            messageType: (messageType as MessageType) || MessageType.TEXT
        };

        // Agregar campos de audio si es una nota de voz
        if (messageType === 'VOICE_NOTE') {
            if (audioUrl) messageData.audioUrl = audioUrl;
            if (audioDuration) messageData.audioDuration = parseInt(audioDuration);
            if (audioSize) messageData.audioSize = parseInt(audioSize);
            if (transcription) messageData.transcription = transcription;
        }

        // Agregar campos de imagen si es una imagen
        if (messageType === 'IMAGE') {
            console.log('🖼️ Processing IMAGE message:', { imageUrl, imageWidth, imageHeight });
            if (imageUrl) messageData.imageUrl = imageUrl;
            if (imageWidth) messageData.imageWidth = parseInt(imageWidth);
            if (imageHeight) messageData.imageHeight = parseInt(imageHeight);
        }

        console.log('💾 Creating message with data:', messageData);

        const message = await prisma.message.create({
            data: messageData,
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profile: true
                    }
                }
            }
        });

        console.log('✅ Message created:', {
            id: message.id,
            messageType: message.messageType,
            imageUrl: message.imageUrl
        });

        // Actualizar la conversación con el último mensaje
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content.trim(),
                lastMessageAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Enviar notificaciones push a los otros participantes
        try {
            const otherParticipants = await prisma.conversationParticipant.findMany({
                where: {
                    conversationId: conversationId,
                    userId: { not: decoded.userId }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            pushToken: true
                        }
                    }
                }
            });

            const senderName = message.sender.username;
            let notificationBody = content.trim();

            // Personalizar el cuerpo según el tipo de mensaje
            if (messageType === 'IMAGE') {
                notificationBody = '📷 Imagen';
            } else if (messageType === 'VOICE_NOTE') {
                notificationBody = '🎤 Nota de voz';
            } else if (messageType === 'BOOK_RECOMMENDATION') {
                notificationBody = '📚 Recomendación de libro';
            }

            // Enviar notificación a cada participante que tenga pushToken
            for (const participant of otherParticipants) {
                if (participant.user.pushToken) {
                    PushNotificationService.notifyNewChatMessage(
                        participant.user.pushToken,
                        senderName,
                        notificationBody,
                        conversationId,
                        decoded.userId
                    ).catch(error => {
                        console.error('Error sending push notification:', error);
                    });
                }
            }
        } catch (notifError) {
            console.error('Error sending push notifications:', notifError);
            // No fallar el request si las notificaciones fallan
        }

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}