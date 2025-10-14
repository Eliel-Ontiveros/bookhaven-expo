import { NextRequest, NextResponse } from 'next/server';
import { APIResponse, BookResponse, BookSearchParams, PaginationResponse } from '@/lib/types/api';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

function transformGoogleBookToBookResponse(item: any): BookResponse {
    const volumeInfo = item.volumeInfo || {};

    // Log para debugging
    if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Transforming book:', {
            id: item.id,
            title: volumeInfo.title,
            authors: volumeInfo.authors,
            hasImage: !!volumeInfo.imageLinks
        });
    }

    return {
        id: item.id || `temp_${Date.now()}_${Math.random()}`,
        title: volumeInfo.title || 'Título no disponible',
        authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconocido',
        image: volumeInfo.imageLinks?.thumbnail ||
            volumeInfo.imageLinks?.smallThumbnail ||
            volumeInfo.imageLinks?.small ||
            volumeInfo.imageLinks?.medium ||
            null,
        description: volumeInfo.description || 'Descripción no disponible',
        categories: volumeInfo.categories || [],
        averageRating: volumeInfo.averageRating || null
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

        console.log('🔍 Google Books API URL:', url);

        const response = await fetch(url);

        if (!response.ok) {
            console.error('❌ Google Books API Error:', response.status, response.statusText);
            throw new Error(`Error al obtener datos de Google Books: ${response.status}`);
        }

        const data = await response.json();
        console.log('📚 Google Books Raw Response:', {
            totalItems: data.totalItems,
            itemsCount: data.items?.length || 0,
            firstItem: data.items?.[0] ? {
                id: data.items[0].id,
                title: data.items[0].volumeInfo?.title,
                authors: data.items[0].volumeInfo?.authors
            } : 'No items'
        });

        const books = (data.items || []).map(transformGoogleBookToBookResponse);
        console.log('📖 Transformed Books:', books.slice(0, 2)); // Solo los primeros 2 para no saturar logs

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