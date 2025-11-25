import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { getSignedImageUrl } from '@/lib/aws/s3';
import { APIResponse } from '@/lib/types/api';

export async function GET(req: NextRequest) {
    try {
        console.log('🔗 Image URL endpoint called');
        console.log('📡 Full URL:', req.url);
        console.log('📡 NextUrl:', req.nextUrl.toString());

        // Verificar autenticación
        const user = await AuthService.getUserFromRequest(req);
        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        // Obtener la clave S3 desde los query params
        const searchParams = req.nextUrl.searchParams;
        const s3Key = searchParams.get('key');

        console.log('📥 Received params:', { s3Key, allParams: Object.fromEntries(searchParams.entries()) });

        if (!s3Key) {
            console.error('❌ Missing S3 key parameter');
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Se requiere la clave S3'
            }, { status: 400 });
        }

        // Validar que la clave sea para imágenes
        if (!s3Key.startsWith('images/')) {
            console.error('❌ Invalid S3 key format:', s3Key);
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Clave S3 inválida'
            }, { status: 400 });
        }

        // Generar URL firmada
        const signedUrl = await getSignedImageUrl(s3Key);

        return NextResponse.json<APIResponse<{ url: string }>>({
            success: true,
            data: { url: signedUrl }
        });

    } catch (error) {
        console.error('❌ Error generating image URL:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error al generar URL de imagen'
        }, { status: 500 });
    }
}
