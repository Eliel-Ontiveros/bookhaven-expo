import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Obtener todas las conversaciones del usuario
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: {
                    some: {
                        userId: decoded.userId
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error al obtener conversaciones:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Crear nueva conversación
export async function POST(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const { participantIds, isGroup = false, name } = await request.json();

        // Convertir participantIds a números si están como strings
        const participantIdsAsNumbers = participantIds.map((id: string | number) =>
            typeof id === 'string' ? parseInt(id) : id
        );

        // Verificar que se incluyan participantes
        if (!participantIdsAsNumbers || participantIdsAsNumbers.length === 0) {
            return NextResponse.json({ error: 'Se requieren participantes' }, { status: 400 });
        }

        // Para chats 1:1, verificar si ya existe una conversación
        if (!isGroup && participantIdsAsNumbers.length === 1) {
            const existingConversation = await prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    participants: {
                        every: {
                            userId: {
                                in: [decoded.userId, participantIdsAsNumbers[0]]
                            }
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            });

            if (existingConversation && existingConversation.participants.length === 2) {
                return NextResponse.json(existingConversation);
            }
        }

        // Crear nueva conversación
        const conversation = await prisma.conversation.create({
            data: {
                name: isGroup ? name : null,
                isGroup,
                participants: {
                    create: [
                        { userId: decoded.userId },
                        ...participantIdsAsNumbers.map((id: number) => ({ userId: id }))
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            include: {
                                profile: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
        console.error('Error al crear conversación:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}