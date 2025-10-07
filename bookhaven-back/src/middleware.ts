import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Solo loggear rutas de API
    if (pathname.startsWith('/api/')) {
        const timestamp = new Date().toLocaleString('es-ES');
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'localhost';

        // Log colorizado según el método HTTP
        const methodColor = {
            'GET': '🔍',
            'POST': '📝',
            'PUT': '✏️',
            'DELETE': '🗑️',
            'OPTIONS': '⚙️'
        }[method] || '❓';

        console.log(`${methodColor} [${timestamp}] ${method.padEnd(7)} ${pathname} ${ip !== 'localhost' ? `(${ip})` : ''}`);

        // Log específico para diferentes tipos de endpoints
        if (pathname.includes('/auth/login')) {
            console.log('   └─ 🔐 User login attempt');
        } else if (pathname.includes('/auth/register')) {
            console.log('   └─ � New user registration');
        } else if (pathname.includes('/auth/me')) {
            console.log('   └─ 🔍 User profile check');
        } else if (pathname.includes('/books/search')) {
            console.log('   └─ 📚 Book search request');
        } else if (pathname.includes('/booklists')) {
            console.log('   └─ 📋 Booklist operation');
        } else if (pathname.includes('/comments')) {
            console.log('   └─ 💬 Comment operation');
        } else if (pathname.includes('/ratings')) {
            console.log('   └─ ⭐ Rating operation');
        }
    }

    // Para cualquier ruta que no sea API, devolver información del servidor
    if (!pathname.startsWith('/api/')) {
        console.log(`❌ [${new Date().toLocaleString('es-ES')}] Non-API request to: ${pathname}`);

        return new NextResponse(
            JSON.stringify({
                error: 'This is an API-only server',
                message: 'No web interface available. This server only provides API endpoints.',
                server: 'BookHaven API v1.0.0',
                type: 'headless-api',
                apiBase: '/api',
                documentation: 'See API_DOCUMENTATION.md for available endpoints',
                availableEndpoints: [
                    'GET /api - Server information',
                    'POST /api/auth/login - User login',
                    'POST /api/auth/register - User registration',
                    'GET /api/books/search - Search books',
                    'GET /api/booklists - Get user booklists',
                    '... and more (check documentation)'
                ]
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Server': 'BookHaven-API-v1.0.0',
                },
            }
        );
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};