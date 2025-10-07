import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, BookResponse } from '@/lib/types/api';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

function transformGoogleBookToBookResponse(volumeInfo: any, id: string): BookResponse {
    return {
        id,
        title: volumeInfo.title || 'Título no disponible',
        authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconocido',
        image: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
        description: volumeInfo.description,
        categories: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating
    };
}

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const bookId = params.id;

        if (!bookId) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'ID del libro es obligatorio'
            }, { status: 400 });
        }

        const url = `${GOOGLE_BOOKS_API_URL}/${bookId}?key=${API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json<APIResponse>({
                    success: false,
                    error: 'Libro no encontrado'
                }, { status: 404 });
            }
            throw new Error('Error al obtener datos de Google Books');
        }

        const data = await response.json();
        const book = transformGoogleBookToBookResponse(data.volumeInfo || {}, data.id);

        return NextResponse.json<APIResponse<BookResponse>>({
            success: true,
            data: book
        });

    } catch (error) {
        console.error('Error al obtener libro:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error al obtener información del libro'
        }, { status: 500 });
    }
}