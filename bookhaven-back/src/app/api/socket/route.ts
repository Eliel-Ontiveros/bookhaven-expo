import { NextRequest, NextResponse } from 'next/server';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { PrismaClient, MessageType } from '@prisma/client';

const prisma = new PrismaClient();

declare global {
    var io: Server | undefined;
}

// GET endpoint para establecer Socket.IO
export async function GET(req: NextRequest) {
    if (!global.io) {
        console.log('🚀 Starting Socket.IO server...');

        // Crear servidor HTTP básico para Socket.IO
        const httpServer = require('http').createServer();
        global.io = new Server(httpServer, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            },
            transports: ['polling', 'websocket']
        });

        // Middleware de autenticación
        global.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error('Token requerido'));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
                socket.data.userId = decoded.userId;

                // Obtener información del usuario
                const user = await prisma.user.findUnique({
                    where: { id: decoded.userId },
                    select: {
                        id: true,
                        username: true,
                        profile: true
                    }
                });

                socket.data.user = user;
                next();
            } catch (error) {
                next(new Error('Token inválido'));
            }
        });

        global.io.on('connection', (socket) => {
            const userId = socket.data.userId;
            console.log(`Usuario conectado: ${socket.data.user?.username} (${userId})`);

            // Unirse a las salas de conversaciones del usuario
            socket.on('join-conversations', async () => {
                try {
                    const conversations = await prisma.conversationParticipant.findMany({
                        where: { userId: userId },
                        select: { conversationId: true }
                    });

                    conversations.forEach(conv => {
                        socket.join(`conversation-${conv.conversationId}`);
                    });
                } catch (error) {
                    console.error('Error al unirse a conversaciones:', error);
                }
            });

            // Unirse a una conversación específica
            socket.on('join-conversation', (conversationId: number) => {
                socket.join(`conversation-${conversationId}`);
            });

            // Salir de una conversación
            socket.on('leave-conversation', (conversationId: number) => {
                socket.leave(`conversation-${conversationId}`);
            });

            // Enviar mensaje
            socket.on('send-message', async (data: {
                conversationId: number;
                content: string;
                messageType?: string;
            }) => {
                try {
                    // Verificar que el usuario es participante
                    const participant = await prisma.conversationParticipant.findUnique({
                        where: {
                            userId_conversationId: {
                                userId: userId,
                                conversationId: data.conversationId
                            }
                        }
                    });

                    if (!participant) {
                        socket.emit('error', 'No tienes acceso a esta conversación');
                        return;
                    }

                    // Crear el mensaje en la base de datos
                    const message = await prisma.message.create({
                        data: {
                            content: data.content,
                            senderId: userId,
                            conversationId: data.conversationId,
                            messageType: (data.messageType as MessageType) || MessageType.TEXT
                        },
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

                    // Actualizar la conversación
                    await prisma.conversation.update({
                        where: { id: data.conversationId },
                        data: {
                            lastMessage: data.content,
                            lastMessageAt: new Date(),
                            updatedAt: new Date()
                        }
                    });

                    // Emitir el mensaje a todos los participantes de la conversación
                    global.io?.to(`conversation-${data.conversationId}`).emit('new-message', message);

                    // Emitir notificación de conversación actualizada
                    global.io?.to(`conversation-${data.conversationId}`).emit('conversation-updated', {
                        conversationId: data.conversationId,
                        lastMessage: data.content,
                        lastMessageAt: new Date(),
                        senderId: userId
                    });

                } catch (error) {
                    console.error('Error al enviar mensaje:', error);
                    socket.emit('error', 'Error al enviar mensaje');
                }
            });

            // Indicar que el usuario está escribiendo
            socket.on('typing-start', (conversationId: number) => {
                socket.to(`conversation-${conversationId}`).emit('user-typing', {
                    userId: userId,
                    username: socket.data.user?.username,
                    conversationId
                });
            });

            // Indicar que el usuario dejó de escribir
            socket.on('typing-stop', (conversationId: number) => {
                socket.to(`conversation-${conversationId}`).emit('user-stopped-typing', {
                    userId: userId,
                    conversationId
                });
            });

            // Marcar mensajes como leídos
            socket.on('mark-as-read', async (data: { conversationId: number }) => {
                try {
                    await prisma.conversationParticipant.update({
                        where: {
                            userId_conversationId: {
                                userId: userId,
                                conversationId: data.conversationId
                            }
                        },
                        data: {
                            lastReadAt: new Date()
                        }
                    });

                    socket.to(`conversation-${data.conversationId}`).emit('messages-read', {
                        userId: userId,
                        conversationId: data.conversationId,
                        readAt: new Date()
                    });
                } catch (error) {
                    console.error('Error al marcar como leído:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log(`Usuario desconectado: ${socket.data.user?.username} (${userId})`);
            });
        });

        const port = process.env.SOCKET_PORT || 3001;
        httpServer.listen(port, () => {
            console.log(`✅ Socket.IO server running on port ${port}`);
        });
    }

    return NextResponse.json({
        message: 'Socket.IO server running',
        port: process.env.SOCKET_PORT || 3001
    });
}