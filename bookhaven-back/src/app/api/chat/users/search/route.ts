import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// GET - Buscar usuarios para iniciar conversaciones
export async function GET(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';

        if (query.length < 2) {
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {
                        id: {
                            not: decoded.userId // Excluir al usuario actual
                        }
                    },
                    {
                        OR: [
                            {
                                username: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                email: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                username: true,
                email: true,
                profile: {
                    select: {
                        id: true,
                        bio: true
                    }
                }
            },
            take: 20
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}