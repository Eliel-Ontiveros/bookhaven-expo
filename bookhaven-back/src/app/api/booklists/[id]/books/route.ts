import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, AddBookToListRequest } from '@/lib/types/api';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const { id } = await params;
        const listId = parseInt(id);

        if (isNaN(listId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID de lista inválido'
            }, { status: 400 });
        }

        const body: AddBookToListRequest = await req.json();
        const { bookId, title, authors, image, description, categories, averageRating } = body;

        if (!bookId || !title || !authors) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Datos del libro incompletos'
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

        // Verificar si el libro ya está en la lista
        const existingEntry = await prisma.bookListEntry.findFirst({
            where: {
                bookId,
                bookListId: listId
            }
        });

        if (existingEntry) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El libro ya está en la lista'
            }, { status: 409 });
        }

        // Crear o actualizar el libro en la base de datos
        await prisma.book.upsert({
            where: { id: bookId },
            update: {
                title,
                authors,
                image,
                description,
                categories: categories || [],
                averageRating: averageRating !== undefined ? Number(averageRating) : undefined
            },
            create: {
                id: bookId,
                title,
                authors,
                image,
                description,
                categories: categories || [],
                averageRating: averageRating !== undefined ? Number(averageRating) : undefined
            }
        });

        // Agregar el libro a la lista
        await prisma.bookListEntry.create({
            data: {
                bookId,
                bookListId: listId
            }
        });

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Libro agregado a la lista exitosamente'
        });

    } catch (error) {
        console.error('Error al agregar libro a la lista:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const { id } = await params;
        const listId = parseInt(id);

        if (isNaN(listId)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID de lista inválido'
            }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const bookId = searchParams.get('bookId');

        if (!bookId) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID del libro es obligatorio'
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

        // Eliminar el libro de la lista
        const deletedEntry = await prisma.bookListEntry.deleteMany({
            where: {
                bookId,
                bookListId: listId
            }
        });

        if (deletedEntry.count === 0) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El libro no está en la lista'
            }, { status: 404 });
        }

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Libro eliminado de la lista exitosamente'
        });

    } catch (error) {
        console.error('Error al eliminar libro de la lista:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}