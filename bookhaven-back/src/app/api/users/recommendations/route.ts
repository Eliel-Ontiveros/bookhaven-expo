import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { APIResponse, BookResponse } from '@/lib/types/api';

// Función para buscar recomendaciones en Google Books API
async function fetchGoogleBooksRecommendations(
    favoriteGenres: string[],
    excludeBookIds: string[],
    limit: number = 5
): Promise<any[]> {
    try {
        const recommendations: any[] = [];

        // Mapeo de géneros a términos que Google Books reconoce mejor
        const genreMapping: { [key: string]: string } = {
            'Ficción': 'fiction',
            'Ficcion': 'fiction',
            'Romance': 'romance',
            'Fantasía': 'fantasy',
            'Fantasia': 'fantasy',
            'Ciencia Ficción': 'science fiction',
            'Ciencia Ficcion': 'science fiction',
            'Misterio': 'mystery',
            'Historia': 'history',
            'Biografía': 'biography',
            'Biografia': 'biography',
            'Poesía': 'poetry',
            'Poesia': 'poetry',
            'Drama': 'drama',
            'Aventura': 'adventure',
            'Terror': 'horror',
            'Comedia': 'humor',
            'Comic': 'comics',
            'Cómic': 'comics',
            'Novela': 'fiction',
            'Viajes': 'travel',
            'Filosofía': 'philosophy',
            'Filosofia': 'philosophy',
            'Religioso': 'religion',
            'Autoayuda': 'self help',
            'Negocios': 'business',
            'Ciencia': 'science',
            'Tecnología': 'technology',
            'Tecnologia': 'technology',
            'Arte': 'art',
            'Música': 'music',
            'Musica': 'music',
            'Cocina': 'cooking',
            'Salud': 'health',
            'Deportes': 'sports'
        };

        // Para cada género favorito, buscar libros
        for (const genre of favoriteGenres.slice(0, 3)) { // Limitar a 3 géneros para no sobrecargar la API
            const searchTerm = genreMapping[genre] || genre.toLowerCase();
            const query = `subject:${searchTerm}`;

            console.log(`🔍 Searching Google Books for genre: ${genre} (${searchTerm})`);

            const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&orderBy=relevance&langRestrict=en`;

            const response = await fetch(googleBooksUrl, {
                headers: {
                    'User-Agent': 'BookHaven/1.0.0'
                }
            });

            if (response.ok) {
                const data = await response.json();

                if (data.items && Array.isArray(data.items)) {
                    for (const item of data.items.slice(0, 4)) { // Máximo 4 por género
                        const volumeInfo = item.volumeInfo;

                        if (!volumeInfo.title || !volumeInfo.authors) continue;

                        const bookId = item.id;

                        // Verificar que no esté ya en las listas del usuario
                        if (excludeBookIds.includes(bookId)) continue;

                        // Verificar que no esté ya en las recomendaciones
                        if (recommendations.find(r => r.id === bookId)) continue;

                        const book = {
                            id: bookId,
                            title: volumeInfo.title,
                            authors: Array.isArray(volumeInfo.authors)
                                ? volumeInfo.authors.join(', ')
                                : volumeInfo.authors || 'Autor desconocido',
                            image: volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail,
                            description: volumeInfo.description || 'Sin descripción disponible',
                            categories: volumeInfo.categories || [genre],
                            averageRating: volumeInfo.averageRating || 4.0,
                        };

                        recommendations.push(book);

                        if (recommendations.length >= limit) break;
                    }
                }
            } else {
                console.error(`Error fetching from Google Books: ${response.status}`);
            }

            if (recommendations.length >= limit) break;
        }

        console.log(`✅ Found ${recommendations.length} Google Books recommendations`);
        return recommendations;

    } catch (error) {
        console.error('Error fetching Google Books recommendations:', error);
        return [];
    }
}

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

        console.log(`🎭 User ${user.id} favorite genres:`, userGenres.map(g => g.name));

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

        console.log(`📚 User has ${userBookIds.length} books in their lists`);

        // Obtener recomendaciones desde Google Books API basadas en géneros favoritos
        let recommendations: any[] = [];

        if (userGenres.length > 0) {
            console.log('🎭 Getting recommendations based on favorite genres');
            recommendations = await fetchGoogleBooksRecommendations(
                userGenres.map(g => g.name),
                userBookIds,
                10
            );
        }

        // Si no hay géneros favoritos o no hay suficientes recomendaciones, 
        // buscar libros populares de géneros generales
        if (recommendations.length < 5) {
            console.log('📈 Adding popular books to reach minimum recommendations');
            const popularGenres = ['fiction', 'fantasy', 'mystery', 'romance', 'science fiction'];
            const additionalRecommendations = await fetchGoogleBooksRecommendations(
                popularGenres,
                [...userBookIds, ...recommendations.map(r => r.id)],
                10 - recommendations.length
            );

            recommendations = [...recommendations, ...additionalRecommendations];
        }

        console.log(`📚 Final recommendations for user ${user.id}:`, recommendations.length);
        console.log('📖 Book titles:', recommendations.map(r => r.title));

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