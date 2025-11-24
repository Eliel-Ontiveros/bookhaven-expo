import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, MessageType } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Obtener mensajes de una conversación
export async function GET(
    request: NextRequest,
    { params }: { params: { conversationId: string } }
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
    { params }: { params: { conversationId: string } }
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
            transcription
        } = await request.json();

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

        // Actualizar la conversación con el último mensaje
        await prisma.conversation.update({
            where: { id: conversationId },
            data: {
                lastMessage: content.trim(),
                lastMessageAt: new Date(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json(message, { status: 201 });
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}