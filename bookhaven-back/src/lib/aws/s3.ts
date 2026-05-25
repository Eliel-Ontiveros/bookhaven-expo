import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configuración de Cloudflare R2 (compatible con API de S3)
const accountId = process.env.R2_ACCOUNT_ID || '';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export const S3_CONFIG = {
    BUCKET_NAME: process.env.R2_BUCKET_NAME || 'bookhaven-multimedia-content',
    REGION: 'auto',
    URL_EXPIRATION: 3600 * 24, // 24 horas
} as const;

/**
 * Sube un archivo de audio a S3
 */
export async function uploadVoiceNote(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'audio/mp4'
): Promise<string> {
    try {
        const key = `voice-notes/${Date.now()}-${fileName}`;

        console.log('🔧 S3 Configuration:', {
            bucket: S3_CONFIG.BUCKET_NAME,
            region: S3_CONFIG.REGION,
            keyPath: key,
            hasCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
        });

        const command = new PutObjectCommand({
            Bucket: S3_CONFIG.BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            Metadata: {
                uploadedAt: new Date().toISOString(),
                type: 'voice-note',
            },
        });

        await s3Client.send(command);

        console.log('✅ File uploaded successfully to R2:', key);

        // Retornar la clave del archivo (no URL pública)
        return key;
    } catch (error) {
        console.error('Error uploading voice note to S3:', error);
        throw new Error('Failed to upload voice note');
    }
}/**
 * Genera una URL firmada para acceder al archivo de audio
 */
export async function getSignedVoiceNoteUrl(key: string): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_CONFIG.BUCKET_NAME,
            Key: key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: S3_CONFIG.URL_EXPIRATION
        });

        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        throw new Error('Failed to generate voice note URL');
    }
}

/**
 * Elimina un archivo de audio de S3
 */
export async function deleteVoiceNote(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_CONFIG.BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting voice note from S3:', error);
        throw new Error('Failed to delete voice note');
    }
}

/**
 * Sube una imagen a S3
 */
export async function uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    contentType: string = 'image/jpeg'
): Promise<string> {
    try {
        const key = `images/${Date.now()}-${fileName}`;

        console.log('🔧 S3 Image Upload:', {
            bucket: S3_CONFIG.BUCKET_NAME,
            region: S3_CONFIG.REGION,
            keyPath: key,
            contentType
        });

        const command = new PutObjectCommand({
            Bucket: S3_CONFIG.BUCKET_NAME,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
            Metadata: {
                uploadedAt: new Date().toISOString(),
                type: 'image',
            },
        });

        await s3Client.send(command);

        console.log('✅ Image uploaded successfully to R2:', key);

        return key;
    } catch (error) {
        console.error('Error uploading image to S3:', error);
        throw new Error('Failed to upload image');
    }
}

/**
 * Genera una URL firmada para acceder a una imagen
 */
export async function getSignedImageUrl(key: string): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: S3_CONFIG.BUCKET_NAME,
            Key: key,
        });

        const signedUrl = await getSignedUrl(s3Client, command, {
            expiresIn: S3_CONFIG.URL_EXPIRATION
        });

        return signedUrl;
    } catch (error) {
        console.error('Error generating signed URL for image:', error);
        throw new Error('Failed to generate image URL');
    }
}

/**
 * Elimina una imagen de S3
 */
export async function deleteImage(key: string): Promise<void> {
    try {
        const command = new DeleteObjectCommand({
            Bucket: S3_CONFIG.BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);
    } catch (error) {
        console.error('Error deleting image from S3:', error);
        throw new Error('Failed to delete image');
    }
}

/**
 * Verifica que las credenciales de Cloudflare R2 estén configuradas
 */
export function validateAWSConfig(): boolean {
    const requiredEnvVars = [
        'R2_ACCOUNT_ID',
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_BUCKET_NAME',
    ];

    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
        console.error('Missing required Cloudflare R2 environment variables:', missing);
        return false;
    }

    return true;
}