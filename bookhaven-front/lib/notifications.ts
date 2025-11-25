import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    /**
     * Registra el dispositivo para notificaciones push y obtiene el token
     */
    static async registerForPushNotificationsAsync(): Promise<string | null> {
        try {
            let token: string | null = null;

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                });
            }

            if (Device.isDevice) {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.warn('Failed to get push token for push notification!');
                    return null;
                }

                // Obtener el token de Expo
                const projectId = Constants.expoConfig?.extra?.eas?.projectId;

                if (!projectId) {
                    console.warn('Project ID not found in app.json');
                    // Intentar obtener el token sin projectId (para desarrollo)
                    token = (await Notifications.getExpoPushTokenAsync()).data;
                } else {
                    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                }

                console.log('✅ Push token obtained:', token);
            } else {
                console.warn('Must use physical device for Push Notifications');
            }

            return token;
        } catch (error) {
            console.error('Error getting push token:', error);
            return null;
        }
    }

    /**
     * Configura los listeners de notificaciones
     */
    static setupNotificationListeners(
        onNotificationReceived?: (notification: Notifications.Notification) => void,
        onNotificationResponse?: (response: Notifications.NotificationResponse) => void
    ) {
        // Listener para notificaciones recibidas cuando la app está abierta
        const notificationListener = Notifications.addNotificationReceivedListener(notification => {
            console.log('📬 Notification received:', notification);
            onNotificationReceived?.(notification);
        });

        // Listener para cuando el usuario toca una notificación
        const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('👆 Notification tapped:', response);
            onNotificationResponse?.(response);
        });

        // Retornar función de cleanup
        return () => {
            notificationListener.remove();
            responseListener.remove();
        };
    }

    /**
     * Muestra una notificación local (para testing o uso offline)
     */
    static async scheduleLocalNotification(
        title: string,
        body: string,
        data?: any,
        trigger?: Notifications.NotificationTriggerInput
    ) {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: trigger || null, // null significa "ahora"
            });
        } catch (error) {
            console.error('Error scheduling local notification:', error);
        }
    }

    /**
     * Cancela todas las notificaciones pendientes
     */
    static async cancelAllNotifications() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }

    /**
     * Obtiene el badge count actual
     */
    static async getBadgeCount(): Promise<number> {
        return await Notifications.getBadgeCountAsync();
    }

    /**
     * Establece el badge count
     */
    static async setBadgeCount(count: number) {
        await Notifications.setBadgeCountAsync(count);
    }

    /**
     * Limpia el badge
     */
    static async clearBadge() {
        await Notifications.setBadgeCountAsync(0);
    }
}
