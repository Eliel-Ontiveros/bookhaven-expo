import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Obtener información de la conversación incluyendo participantes
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ conversationId: string }> }
) {
    const { conversationId } = await params;
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const conversationIdInt = parseInt(conversationId);

        // Verificar que el usuario es participante de la conversación
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                userId_conversationId: {
                    userId: decoded.userId,
                    conversationId: conversationIdInt
                }
            }
        });

        if (!participant) {
            return NextResponse.json({ error: 'No tienes acceso a esta conversación' }, { status: 403 });
        }

        // Obtener información de la conversación con participantes
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationIdInt },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile: {
                                    select: {
                                        bio: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversación no encontrada' }, { status: 404 });
        }

        // Encontrar al otro participante (no el usuario actual)
        const otherParticipant = conversation.participants.find(
            (p: any) => p.user.id !== decoded.userId
        );

        return NextResponse.json({
            success: true,
            data: {
                id: conversation.id,
                name: conversation.name,
                isGroup: conversation.isGroup,
                createdAt: conversation.createdAt,
                participants: conversation.participants.map((p: any) => ({
                    id: p.user.id,
                    username: p.user.username,
                    bio: p.user.profile?.bio,
                    joinedAt: p.joinedAt,
                    isCurrentUser: p.user.id === decoded.userId
                })),
                otherParticipant: otherParticipant ? {
                    id: otherParticipant.user.id,
                    username: otherParticipant.user.username,
                    bio: otherParticipant.user.profile?.bio
                } : null
            }
        });

    } catch (error) {
        console.error('Error al obtener información de la conversación:', error);
        return NextResponse.json({
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}