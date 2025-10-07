import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, BookListResponse } from '@/lib/types/api';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const listId = parseInt(params.id);

        if (isNaN(listId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID de lista inválido'
            }, { status: 400 });
        }

        const bookList = await prisma.bookList.findFirst({
            where: {
                id: listId,
                userId: user.id
            },
            select: {
                id: true,
                name: true,
                userId: true,
                createdAt: true,
                entries: {
                    select: {
                        id: true,
                        bookId: true,
                        addedAt: true,
                        book: {
                            select: {
                                id: true,
                                title: true,
                                authors: true,
                                image: true,
                                description: true,
                                categories: true,
                                averageRating: true
                            }
                        }
                    },
                    orderBy: { addedAt: 'desc' }
                }
            }
        });

        if (!bookList) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Lista no encontrada'
            }, { status: 404 });
        }

        return NextResponse.json<APIResponse<BookListResponse>>({
            success: true,
            data: bookList
        });

    } catch (error) {
        console.error('Error al obtener lista:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const listId = parseInt(params.id);

        if (isNaN(listId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID de lista inválido'
            }, { status: 400 });
        }

        // Verificar que la lista pertenece al usuario
        const bookList = await prisma.bookList.findFirst({
            where: {
                id: listId,
                userId: user.id
            }
        });

        if (!bookList) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Lista no encontrada'
            }, { status: 404 });
        }

        // Eliminar entradas primero
        await prisma.bookListEntry.deleteMany({
            where: { bookListId: listId }
        });

        // Eliminar la lista
        await prisma.bookList.delete({
            where: { id: listId }
        });

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Lista eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar lista:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}