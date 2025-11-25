import { API_CONFIG } from './config';

export class NotificationAPIService {
    /**
     * Registra el push token en el backend
     */
    static async registerPushToken(pushToken: string, authToken: string): Promise<void> {
        try {
            console.log('📱 Registering push token with backend');

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER_PUSH_TOKEN}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify({ pushToken }),
                }
            );

            if (!response.ok) {
                throw new Error(`Error registering push token: ${response.status}`);
            }

            console.log('✅ Push token registered successfully');
        } catch (error) {
            console.error('❌ Error registering push token:', error);
            throw error;
        }
    }

    /**
     * Elimina el push token del backend (logout)
     */
    static async unregisterPushToken(authToken: string): Promise<void> {
        try {
            console.log('🗑️ Unregistering push token from backend');

            const response = await fetch(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER_PUSH_TOKEN}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Error unregistering push token: ${response.status}`);
            }

            console.log('✅ Push token unregistered successfully');
        } catch (error) {
            console.error('❌ Error unregistering push token:', error);
            throw error;
        }
    }
}
