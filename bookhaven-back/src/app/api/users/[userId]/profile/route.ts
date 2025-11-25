import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Obtener perfil público de un usuario
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;
    try {
        const userIdInt = parseInt(userId);

        if (isNaN(userIdInt)) {
            return NextResponse.json({ error: 'ID de usuario inválido' }, { status: 400 });
        }

        // Obtener información pública del usuario
        const user = await prisma.user.findUnique({
            where: { id: userIdInt },
            select: {
                id: true,
                username: true,
                profile: {
                    select: {
                        bio: true
                    }
                },
                favoriteGenres: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        bookLists: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Obtener las listas de libros públicas del usuario
        const bookLists = await prisma.bookList.findMany({
            where: {
                userId: userIdInt,
                // Aquí podrías agregar un campo `isPublic` si quieres privacidad
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                entries: {
                    select: {
                        id: true,
                        addedAt: true,
                        book: {
                            select: {
                                id: true,
                                title: true,
                                authors: true,
                                image: true,
                                categories: true,
                                averageRating: true
                            }
                        }
                    },
                    orderBy: {
                        addedAt: 'desc'
                    },
                    take: 10 // Limitar a los 10 libros más recientes por lista
                },
                _count: {
                    select: {
                        entries: true
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    bio: user.profile?.bio,
                    favoriteGenres: user.favoriteGenres.map((g: { name: string }) => g.name),
                    totalLists: user._count.bookLists
                },
                bookLists: bookLists.map(list => ({
                    id: list.id,
                    name: list.name,
                    createdAt: list.createdAt,
                    totalBooks: list._count.entries,
                    recentBooks: list.entries.map(entry => ({
                        id: entry.id,
                        addedAt: entry.addedAt,
                        book: entry.book
                    }))
                }))
            }
        });

    } catch (error) {
        console.error('Error al obtener perfil del usuario:', error);
        return NextResponse.json({
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}