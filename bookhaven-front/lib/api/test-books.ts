import { API_CONFIG } from './config';

/**
 * Función de utilidad para probar la conectividad y mostrar datos reales
 */
export async function testGoogleBooksAPI() {
    try {
        console.log('🧪 Probando Google Books API...');

        const response = await fetch(`${API_CONFIG.BASE_URL}/api/books/search?query=Harry&limit=3`);

        if (response.ok) {
            const data = await response.json();

            if (data.success && data.data?.data) {
                console.log('✅ Google Books API funcionando correctamente');
                console.log(`📊 Encontrados ${data.data.data.length} libros`);

                // Mostrar los primeros libros con detalles
                data.data.data.forEach((book: any, index: number) => {
                    console.log(`📖 Libro ${index + 1}:`);
                    console.log(`   Título: ${book.title}`);
                    console.log(`   Autor: ${book.authors}`);
                    console.log(`   ID: ${book.id}`);
                    console.log(`   Imagen: ${book.image ? 'Disponible' : 'No disponible'}`);
                    console.log('   ---');
                });

                return {
                    success: true,
                    books: data.data.data,
                    message: `Se encontraron ${data.data.data.length} libros`
                };
            } else {
                console.log('❌ La API respondió pero sin datos de libros');
                return {
                    success: false,
                    message: 'No se encontraron libros en la respuesta'
                };
            }
        } else {
            console.log('❌ Error en la respuesta de la API:', response.status);
            return {
                success: false,
                message: `Error HTTP: ${response.status}`
            };
        }
    } catch (error) {
        console.log('❌ Error probando Google Books API:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Error desconocido'
        };
    }
}

/**
 * Función para mostrar datos de un libro de forma legible
 */
export function logBookDetails(book: any, label = 'Libro') {
    console.log(`📚 ${label}:`, {
        id: book.id,
        title: book.title,
        authors: book.authors,
        hasImage: !!book.image,
        description: book.description?.substring(0, 100) + '...',
        categories: book.categories
    });
}