import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { uploadImage, validateAWSConfig } from '@/lib/aws/s3';
import { APIResponse } from '@/lib/types/api';

export async function POST(req: NextRequest) {
    try {
        console.log('🖼️ Upload image - Request received');

        // Verificar autenticación
        const user = await AuthService.getUserFromRequest(req);
        if (!user) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No autorizado'
            }, { status: 401 });
        }

        // Verificar configuración de AWS
        if (!validateAWSConfig()) {
            console.error('AWS configuration is invalid');
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Configuración de almacenamiento no disponible'
            }, { status: 500 });
        }

        // Obtener el archivo del FormData
        const formData = await req.formData();
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No se proporcionó archivo de imagen'
            }, { status: 400 });
        }

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic'];
        if (!allowedTypes.includes(imageFile.type)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Tipo de archivo no permitido. Use JPEG, PNG, WEBP o HEIC'
            }, { status: 400 });
        }

        // Validar tamaño (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El archivo es demasiado grande. Máximo 5MB'
            }, { status: 400 });
        }

        // Convertir archivo a buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generar nombre de archivo único
        const fileExtension = imageFile.name.split('.').pop() || 'jpg';
        const fileName = `image-${Date.now()}-${user.id}.${fileExtension}`;

        console.log('📁 Uploading image:', fileName, 'Size:', imageFile.size, 'Type:', imageFile.type);

        // Subir a S3
        const s3Key = await uploadImage(buffer, fileName, imageFile.type);

        console.log('✅ Image uploaded successfully. S3 Key:', s3Key);

        return NextResponse.json<APIResponse<{ s3Key: string; size: number }>>({
            success: true,
            data: {
                s3Key,
                size: imageFile.size
            },
            message: 'Imagen subida exitosamente'
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json<APIResponse>({
            success: false,
            error: 'Error interno del servidor'
        }, { status: 500 });
    }
}

// Configurar límites para el endpoint
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '5mb',
        },
    },
}
