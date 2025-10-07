import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, BookListResponse, CreateBookListRequest } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const bookLists = await prisma.bookList.findMany({
            where: { userId: user.id },
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
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json<APIResponse<BookListResponse[]>>({
            success: true,
            data: bookLists
        });

    } catch (error) {
        console.error('Error al obtener listas de libros:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const body: CreateBookListRequest = await req.json();
        const { name } = body;

        if (!name || !name.trim()) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El nombre de la lista es obligatorio'
            }, { status: 400 });
        }

        // Verificar si ya existe una lista con ese nombre
        const existingList = await prisma.bookList.findFirst({
            where: {
                userId: user.id,
                name: name.trim()
            }
        });

        if (existingList) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Ya tienes una lista con ese nombre'
            }, { status: 409 });
        }

        const newList = await prisma.bookList.create({
            data: {
                name: name.trim(),
                userId: user.id
            },
            select: {
                id: true,
                name: true,
                userId: true,
                createdAt: true
            }
        });

        return NextResponse.json<APIResponse<BookListResponse>>({
            success: true,
            data: newList,
            message: 'Lista creada exitosamente'
        }, { status: 201 });

    } catch (error) {
        console.error('Error al crear lista:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}