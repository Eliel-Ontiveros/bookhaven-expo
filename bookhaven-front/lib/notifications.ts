import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Detectar si estamos en Expo Go de manera más precisa
// appOwnership === 'expo' significa Expo Go
// appOwnership === 'standalone' o undefined significa build nativo
const isExpoGo = Constants.appOwnership === 'expo';

console.log('🔔 Notification Service Init:', {
    appOwnership: Constants.appOwnership,
    isExpoGo,
    isDevice: Device.isDevice,
    platform: Platform.OS
});

// Configurar cómo se manejan las notificaciones cuando la app está en foreground
// Siempre configurar - funciona en development builds y production
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export class NotificationService {
    /**
     * Registra el dispositivo para notificaciones push y obtiene el token
     * NOTA: No funciona en Expo Go desde SDK 53, requiere development build
     */
    static async registerForPushNotificationsAsync(): Promise<string | null> {
        // En Expo Go (SDK 53+), las notificaciones push remotas no están soportadas
        // pero sí funcionan en development builds
        if (isExpoGo) {
            console.warn('⚠️ Push notifications are not supported in Expo Go (SDK 53+).');
            console.warn('⚠️ Use "npx expo run:android" or "npx expo run:ios" for a development build.');
            return null;
        }

        try {
            let token: string | null = null;

            // Configurar canal de Android
            if (Platform.OS === 'android') {
                console.log('📱 Setting up Android notification channel...');
                await Notifications.setNotificationChannelAsync('default', {
                    name: 'Default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#8B4513',
                    sound: 'default',
                });
                console.log('✅ Android notification channel created');
            }

            if (Device.isDevice) {
                console.log('📱 Checking notification permissions...');
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                console.log('📱 Current permission status:', existingStatus);

                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    console.log('📱 Requesting notification permissions...');
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                    console.log('📱 New permission status:', finalStatus);
                }

                if (finalStatus !== 'granted') {
                    console.warn('❌ Notification permissions not granted!');
                    return null;
                }

                console.log('📱 Getting Expo push token...');

                // Obtener el token de Expo
                const projectId = Constants.expoConfig?.extra?.eas?.projectId;
                console.log('📱 Project ID:', projectId || 'not configured');

                try {
                    if (projectId) {
                        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                    } else {
                        // Sin projectId, intentar obtener token de todas formas
                        token = (await Notifications.getExpoPushTokenAsync()).data;
                    }
                    console.log('✅ Push token obtained:', token);
                } catch (tokenError) {
                    console.error('❌ Error getting push token:', tokenError);
                    return null;
                }
            } else {
                console.warn('⚠️ Must use physical device for Push Notifications');
            }

            return token;
        } catch (error) {
            console.error('❌ Error in registerForPushNotificationsAsync:', error);
            return null;
        }
    }

    /**
     * Configura los listeners de notificaciones
     * NOTA: No funciona en Expo Go desde SDK 53
     */
    static setupNotificationListeners(
        onNotificationReceived?: (notification: Notifications.Notification) => void,
        onNotificationResponse?: (response: Notifications.NotificationResponse) => void
    ) {
        console.log('🔔 Setting up notification listeners...');

        // En Expo Go no funcionan las push notifications, pero los listeners sí
        // para notificaciones locales

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

        console.log('✅ Notification listeners set up');

        // Retornar función de cleanup
        return () => {
            console.log('🧹 Cleaning up notification listeners');
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
