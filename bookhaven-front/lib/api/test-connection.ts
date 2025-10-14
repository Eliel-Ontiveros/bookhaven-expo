import { apiService } from './service';

/**
 * Función para probar la conectividad con el backend
 */
export async function testBackendConnection(): Promise<{
    success: boolean;
    message: string;
    details?: any;
}> {
    try {
        console.log('🔍 Probando conexión con el backend...');

        // Hacer una petición simple a la ruta base de la API
        const response = await fetch(`${require('./config').API_CONFIG.BASE_URL}/api`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'Conexión exitosa con el backend',
                details: {
                    status: response.status,
                    serverInfo: data
                }
            };
        } else {
            return {
                success: false,
                message: `Error en la conexión: ${response.status} ${response.statusText}`,
                details: {
                    status: response.status,
                    statusText: response.statusText
                }
            };
        }
    } catch (error) {
        return {
            success: false,
            message: 'No se pudo conectar al backend',
            details: {
                error: error instanceof Error ? error.message : 'Error desconocido'
            }
        };
    }
}

/**
 * Función para probar endpoints específicos
 */
export async function testApiEndpoints() {
    const results = {
        connection: await testBackendConnection(),
        endpoints: {
            booksSearch: false,
            auth: false,
            booklists: false,
        }
    };

    if (!results.connection.success) {
        console.error('❌ No se pudo conectar al backend, omitiendo pruebas de endpoints');
        return results;
    }

    try {
        // Probar búsqueda de libros (no requiere autenticación)
        const booksResponse = await apiService.searchBooks({ query: 'test', limit: 1 });
        results.endpoints.booksSearch = booksResponse.success;
        console.log(booksResponse.success ? '✅ Books search endpoint OK' : '❌ Books search endpoint failed');

        // Nota: Los otros endpoints requieren autenticación, se probarán después del login
    } catch (error) {
        console.error('❌ Error probando endpoints:', error);
    }

    return results;
}