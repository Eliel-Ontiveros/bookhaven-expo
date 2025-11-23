import { NextRequest, NextResponse } from 'next/server';

// Endpoint simple para inicializar Socket.IO
export async function GET(req: NextRequest) {
    return NextResponse.json({
        message: 'Socket.IO endpoint ready',
        port: process.env.SOCKET_PORT || 3001,
        status: 'available'
    });
}

// POST para enviar mensajes sin Socket.IO
export async function POST(req: NextRequest) {
    try {
        const { action, data } = await req.json();

        // Por ahora retornamos éxito para que la app funcione
        // En producción esto se conectaría al Socket.IO real
        if (action === 'send-message') {
            return NextResponse.json({
                success: true,
                message: 'Message sent (polling mode)'
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}