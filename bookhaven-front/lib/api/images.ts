import { API_CONFIG, APIResponse } from './config';
import { UploadImageResponse } from './types';
import * as FileSystem from 'expo-file-system/legacy';

export class ImageService {
    private static async getAuthHeaders(token: string) {
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Sube una imagen al servidor
     */
    static async uploadImage(
        imageUri: string,
        fileName: string,
        token: string
    ): Promise<UploadImageResponse> {
        try {
            console.log('🖼️ ImageService.uploadImage - URI:', imageUri);

            // Determinar el tipo MIME de la imagen
            const fileExtension = imageUri.split('.').pop()?.toLowerCase();
            let mimeType = 'image/jpeg';

            if (fileExtension === 'png') {
                mimeType = 'image/png';
            } else if (fileExtension === 'webp') {
                mimeType = 'image/webp';
            } else if (fileExtension === 'heic') {
                mimeType = 'image/heic';
            }

            // Normalizar URL (quitar slash final si existe)
            const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
            const uploadUrl = `${baseUrl}${API_CONFIG.ENDPOINTS.UPLOAD_IMAGE}`;
            console.log('📤 Upload URL:', uploadUrl);

            // Usar FileSystem.uploadAsync que es más confiable para React Native
            const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: 'image',
                mimeType: mimeType,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                parameters: {
                    fileName: fileName,
                },
            });

            console.log('📡 Upload response status:', uploadResult.status);
            console.log('📡 Upload response body:', uploadResult.body);

            if (uploadResult.status !== 200) {
                let errorMessage = `Error uploading image: ${uploadResult.status}`;
                try {
                    const errorData = JSON.parse(uploadResult.body);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = uploadResult.body || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data: APIResponse<UploadImageResponse> = JSON.parse(uploadResult.body);

            if (!data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            console.log('✅ ImageService.uploadImage - Success:', data.data);
            return data.data!;

        } catch (error) {
            console.error('❌ ImageService.uploadImage - Error:', error);
            throw error;
        }
    }

    /**
     * Obtiene la URL firmada para mostrar una imagen
     */
    static async getImageUrl(s3Key: string, token: string): Promise<string> {
        try {
            console.log('🔗 ImageService.getImageUrl - S3 Key:', s3Key);

            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.IMAGES}?key=${encodeURIComponent(s3Key)}`;
            console.log('📡 Full URL:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: await this.getAuthHeaders(token),
            });

            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Error response:', errorText);
                throw new Error(`Error getting image URL: ${response.status}`);
            }

            const data: APIResponse<{ url: string }> = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get image URL');
            }

            console.log('✅ ImageService.getImageUrl - Success');
            return data.data!.url;

        } catch (error) {
            console.error('❌ ImageService.getImageUrl - Error:', error);
            throw error;
        }
    }

    /**
     * Envía una imagen a una conversación
     */
    static async sendImageMessage(
        conversationId: string,
        s3Key: string,
        width: number,
        height: number,
        size: number,
        token: string
    ): Promise<void> {
        try {
            console.log('📤 ImageService.sendImageMessage:', {
                conversationId,
                s3Key,
                width,
                height,
                size
            });

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_MESSAGES}/${conversationId}`,
                {
                    method: 'POST',
                    headers: {
                        ...await this.getAuthHeaders(token),
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: s3Key,
                        messageType: 'IMAGE',
                        imageUrl: s3Key,
                        imageWidth: width,
                        imageHeight: height,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error sending image message');
            }

            console.log('✅ ImageService.sendImageMessage - Success');

        } catch (error) {
            console.error('❌ ImageService.sendImageMessage - Error:', error);
            throw error;
        }
    }
}
