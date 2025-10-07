import { NextResponse } from 'next/server';

export async function GET() {
    const serverInfo = {
        name: 'BookHaven API Server',
        version: '1.0.0',
        status: 'active',
        description: 'API REST para gestión de libros y listas de lectura',
        type: 'headless-api',
        endpoints: {
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                me: 'GET /api/auth/me'
            },
            books: {
                search: 'GET /api/books/search',
                details: 'GET /api/books/[id]'
            },
            booklists: {
                list: 'GET /api/booklists',
                create: 'POST /api/booklists',
                get: 'GET /api/booklists/[id]',
                delete: 'DELETE /api/booklists/[id]',
                addBook: 'POST /api/booklists/[id]/books',
                removeBook: 'DELETE /api/booklists/[id]/books'
            },
            comments: {
                get: 'GET /api/comments',
                create: 'POST /api/comments'
            },
            ratings: {
                get: 'GET /api/ratings',
                create: 'POST /api/ratings',
                delete: 'DELETE /api/ratings'
            },
            users: {
                profile: 'GET /api/users/profile',
                updateProfile: 'PUT /api/users/profile',
                recommendations: 'GET /api/users/recommendations'
            }
        },
        documentation: 'See API_DOCUMENTATION.md for complete API reference',
        note: 'This server provides only API endpoints. No web interface available.'
    };

    // Log en terminal cuando alguien accede a la información del servidor
    console.log('ℹ️  Server info requested');

    return NextResponse.json(serverInfo, {
        headers: {
            'Content-Type': 'application/json',
            'X-API-Server': 'BookHaven-API-v1.0.0'
        }
    });
}