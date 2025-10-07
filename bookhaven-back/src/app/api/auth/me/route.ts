import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { APIResponse, UserProfileResponse } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        const user = await AuthService.getUserFromRequest(req);

        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        return NextResponse.json<APIResponse<UserProfileResponse>>({
            success: true,
            data: user as UserProfileResponse
        });

    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}