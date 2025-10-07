import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, BookResponse } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        // Obtener los géneros favoritos del usuario
        const userGenres = await prisma.favoriteGenre.findMany({
            where: { userId: user.id },
            select: { name: true }
        });

        // Obtener libros que ya están en las listas del usuario
        const userBooks = await prisma.bookListEntry.findMany({
            where: {
                bookList: {
                    userId: user.id
                }
            },
            select: { bookId: true }
        });

        const userBookIds = userBooks.map(entry => entry.bookId);

        // Obtener libros de la base de datos que coincidan con los géneros favoritos
        // y que no estén ya en las listas del usuario
        let recommendations: any[] = [];

        if (userGenres.length > 0) {
            recommendations = await prisma.book.findMany({
                where: {
                    AND: [
                        {
                            categories: {
                                hasSome: userGenres.map(g => g.name)
                            }
                        },
                        {
                            id: {
                                notIn: userBookIds
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    title: true,
                    authors: true,
                    image: true,
                    description: true,
                    categories: true,
                    averageRating: true
                },
                take: 10,
                orderBy: {
                    averageRating: 'desc'
                }
            });
        }

        // Si no hay suficientes recomendaciones basadas en géneros, 
        // agregar libros populares (mejor calificados)
        if (recommendations.length < 5) {
            const popularBooks = await prisma.book.findMany({
                where: {
                    id: {
                        notIn: [...userBookIds, ...recommendations.map(r => r.id)]
                    },
                    averageRating: {
                        gte: 4.0
                    }
                },
                select: {
                    id: true,
                    title: true,
                    authors: true,
                    image: true,
                    description: true,
                    categories: true,
                    averageRating: true
                },
                take: 10 - recommendations.length,
                orderBy: {
                    averageRating: 'desc'
                }
            });

            recommendations = [...recommendations, ...popularBooks];
        }

        return NextResponse.json<APIResponse<BookResponse[]>>({
            success: true,
            data: recommendations
        });

    } catch (error) {
        console.error('Error al obtener recomendaciones:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}