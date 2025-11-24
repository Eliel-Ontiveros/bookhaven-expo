import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { getSignedVoiceNoteUrl } from '@/lib/aws/s3';
import { APIResponse } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        // Verificar autenticación
        const user = await AuthService.getUserFromRequest(req);
        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        // Obtener la clave S3 de los parámetros de consulta
        const { searchParams } = new URL(req.url);
        const s3Key = searchParams.get('key');

        if (!s3Key) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Clave de archivo requerida'
            }, { status: 400 });
        }

        // Generar URL firmada
        const signedUrl = await getSignedVoiceNoteUrl(s3Key);

        return NextResponse.json<APIResponse<{ url: string }>>({
            success: true,
            data: { url: signedUrl },
            message: 'URL generada exitosamente'
        });

    } catch (error) {
        console.error('Error generating voice note URL:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}