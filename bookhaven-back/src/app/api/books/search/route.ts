import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, BookResponse, BookSearchParams, PaginationResponse } from '@/lib/types/api';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

function transformGoogleBookToBookResponse(item: any): BookResponse {
    const volumeInfo = item.volumeInfo || {};

    return {
        id: item.id,
        title: volumeInfo.title || 'Título no disponible',
        authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconocido',
        image: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
        description: volumeInfo.description,
        categories: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating
    };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const category = searchParams.get('category');
        const author = searchParams.get('author');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!query.trim()) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El parámetro query es obligatorio'
            }, { status: 400 });
        }

        // Construir la consulta de Google Books
        let searchQuery = query;
        if (category) {
            searchQuery += `+subject:${category}`;
        }
        if (author) {
            searchQuery += `+inauthor:${author}`;
        }

        const startIndex = (page - 1) * limit;
        const url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(searchQuery)}&maxResults=${limit}&startIndex=${startIndex}&key=${API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Error al obtener datos de Google Books');
        }

        const data = await response.json();
        const books = (data.items || []).map(transformGoogleBookToBookResponse);
        const totalItems = data.totalItems || 0;

        const paginationResponse: PaginationResponse<BookResponse> = {
            data: books,
            pagination: {
                page,
                limit,
                total: totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        };

        return NextResponse.json<APIResponse<PaginationResponse<BookResponse>>>({
            success: true,
            data: paginationResponse
        });

    } catch (error) {
        console.error('Error en búsqueda de libros:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error al buscar libros'
        }, { status: 500 });
    }
}