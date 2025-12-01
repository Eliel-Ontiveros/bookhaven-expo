import { API_CONFIG, APIResponse } from './config';
import { UploadVoiceNoteResponse } from './types';
import * as FileSystem from 'expo-file-system/legacy';

export class VoiceNoteService {
    private static async getAuthHeaders(token: string) {
        return {
            'Authorization': `Bearer ${token}`,
        };
    }

    /**
     * Sube una nota de voz al servidor
     */
    static async uploadVoiceNote(
        audioUri: string,
        fileName: string,
        token: string
    ): Promise<UploadVoiceNoteResponse> {
        try {
            console.log('🎙️ VoiceNoteService.uploadVoiceNote - URI:', audioUri);

            // Normalizar URL (quitar slash final si existe)
            const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
            const uploadUrl = `${baseUrl}${API_CONFIG.ENDPOINTS.UPLOAD_VOICE}`;
            console.log('📤 Upload URL:', uploadUrl);

            // Usar FileSystem.uploadAsync que es más confiable para React Native
            const uploadResult = await FileSystem.uploadAsync(uploadUrl, audioUri, {
                httpMethod: 'POST',
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                fieldName: 'audio',
                mimeType: 'audio/m4a',
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
                let errorMessage = `Error uploading voice note: ${uploadResult.status}`;
                try {
                    const errorData = JSON.parse(uploadResult.body);
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    // Si no es JSON, usar el body como está
                    errorMessage = uploadResult.body || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const data: APIResponse<UploadVoiceNoteResponse> = JSON.parse(uploadResult.body);

            if (!data.success) {
                throw new Error(data.error || 'Upload failed');
            }

            console.log('✅ VoiceNoteService.uploadVoiceNote - Success:', data.data);
            return data.data!;

        } catch (error) {
            console.error('❌ VoiceNoteService.uploadVoiceNote - Error:', error);
            throw error;
        }
    }

    /**
     * Obtiene la URL firmada para reproducir una nota de voz
     */
    static async getVoiceNoteUrl(s3Key: string, token: string): Promise<string> {
        try {
            console.log('🔗 VoiceNoteService.getVoiceNoteUrl - S3 Key:', s3Key);

            const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VOICE_NOTES}?key=${encodeURIComponent(s3Key)}`;
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
                throw new Error(`Error getting voice note URL: ${response.status}`);
            } const data: APIResponse<{ url: string }> = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to get voice note URL');
            }

            console.log('✅ VoiceNoteService.getVoiceNoteUrl - Success');
            return data.data!.url;

        } catch (error) {
            console.error('❌ VoiceNoteService.getVoiceNoteUrl - Error:', error);
            throw error;
        }
    }

    /**
     * Envía un mensaje de voz a una conversación
     */
    static async sendVoiceMessage(
        conversationId: string,
        s3Key: string,
        duration: number,
        size: number,
        token: string
    ): Promise<any> {
        try {
            console.log('📤 VoiceNoteService.sendVoiceMessage - ConversationId:', conversationId);

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_MESSAGES}/${conversationId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...await this.getAuthHeaders(token),
                    },
                    body: JSON.stringify({
                        content: `Nota de voz (${Math.round(duration)}s)`,
                        messageType: 'VOICE_NOTE',
                        audioUrl: s3Key, // Guardamos la key de S3, no la URL
                        audioDuration: duration,
                        audioSize: size,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error(`Error sending voice message: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ VoiceNoteService.sendVoiceMessage - Success');
            return data;

        } catch (error) {
            console.error('❌ VoiceNoteService.sendVoiceMessage - Error:', error);
            throw error;
        }
    }
}