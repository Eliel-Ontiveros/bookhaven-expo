import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth';
import { uploadVoiceNote, validateAWSConfig } from '@/lib/aws/s3';
import { APIResponse } from '@/lib/types/api';

export async function POST(req: NextRequest) {
    try {
        console.log('🎙️ Upload voice note - Request received');

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
        const audioFile = formData.get('audio') as File;

        if (!audioFile) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'No se proporcionó archivo de audio'
            }, { status: 400 });
        }

        // Validar tipo de archivo
        const allowedTypes = ['audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/m4a'];
        if (!allowedTypes.includes(audioFile.type)) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'Tipo de archivo no permitido. Use MP4, MP3, WAV, AAC o M4A'
            }, { status: 400 });
        }

        // Validar tamaño (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (audioFile.size > maxSize) {
            return NextResponse.json<APIResponse>({
                success: false,
                error: 'El archivo es demasiado grande. Máximo 10MB'
            }, { status: 400 });
        }

        // Convertir archivo a buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Generar nombre de archivo único
        const fileExtension = audioFile.name.split('.').pop() || 'mp4';
        const fileName = `voice-${Date.now()}-${user.id}.${fileExtension}`;

        console.log('📁 Uploading file:', fileName, 'Size:', audioFile.size, 'Type:', audioFile.type);

        // Subir a S3
        const s3Key = await uploadVoiceNote(buffer, fileName, audioFile.type);

        console.log('✅ Voice note uploaded successfully. S3 Key:', s3Key);

        return NextResponse.json<APIResponse<{ s3Key: string; duration: number; size: number }>>({
            success: true,
            data: {
                s3Key,
                duration: 0, // Se puede calcular en el frontend o usando FFmpeg
                size: audioFile.size
            },
            message: 'Nota de voz subida exitosamente'
        });

    } catch (error) {
        console.error('Error uploading voice note:', error);
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
            sizeLimit: '10mb',
        },
    },
}