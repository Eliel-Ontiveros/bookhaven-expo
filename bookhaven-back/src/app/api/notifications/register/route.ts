import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { PrismaClient } from '@prisma/client';
import { APIResponse } from '@/lib/types/api';

const prisma = new PrismaClient();

/**
 * POST - Registrar/actualizar el token de push del usuario
 */
export async function POST(req: NextRequest) {
    try {
        console.log('📱 Register push token - Request received');

        // Verificar autenticación
        const user = await AuthService.getUserFromRequest(req);
        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        const { pushToken } = await req.json();

        if (!pushToken) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Token de push requerido'
            }, { status: 400 });
        }

        console.log('💾 Saving push token for user:', user.id);

        // Actualizar el token de push del usuario
        await prisma.user.update({
            where: { id: user.id },
            data: { pushToken } as any
        });

        console.log('✅ Push token saved successfully');

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Token de push registrado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error registering push token:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

/**
 * DELETE - Eliminar el token de push del usuario (logout)
 */
export async function DELETE(req: NextRequest) {
    try {
        console.log('🗑️ Delete push token - Request received');

        // Verificar autenticación
        const user = await AuthService.getUserFromRequest(req);
        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        console.log('💾 Removing push token for user:', user.id);

        // Eliminar el token de push del usuario
        await prisma.user.update({
            where: { id: user.id },
            data: { pushToken: null } as any
        });

        console.log('✅ Push token removed successfully');

        return NextResponse.json<APIResponse>({
            success: true,
            message: 'Token de push eliminado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error removing push token:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}
