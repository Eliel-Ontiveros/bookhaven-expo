import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

// Crear una instancia del SDK de Expo
const expo = new Expo();

export interface PushNotificationData {
    type: 'chat_message' | 'post_comment';
    conversationId?: string;
    postId?: string;
    senderId?: string;
    senderName?: string;
}

export class PushNotificationService {
    /**
     * Envía una notificación push a un dispositivo específico
     */
    static async sendPushNotification(
        pushToken: string,
        title: string,
        body: string,
        data?: PushNotificationData
    ): Promise<boolean> {
        try {
            // Verificar que el token sea válido
            if (!Expo.isExpoPushToken(pushToken)) {
                console.error('❌ Invalid Expo push token:', pushToken);
                return false;
            }

            const message: ExpoPushMessage = {
                to: pushToken,
                sound: 'default',
                title,
                body,
                data: (data as unknown as Record<string, unknown>) || {},
                priority: 'high',
            };

            console.log('📤 Sending push notification:', { title, body, to: pushToken });

            const tickets = await expo.sendPushNotificationsAsync([message]);

            console.log('✅ Push notification sent. Ticket:', tickets[0]);

            return tickets[0].status === 'ok';
        } catch (error) {
            console.error('❌ Error sending push notification:', error);
            return false;
        }
    }

    /**
     * Envía notificaciones a múltiples dispositivos
     */
    static async sendPushNotifications(
        pushTokens: string[],
        title: string,
        body: string,
        data?: PushNotificationData
    ): Promise<ExpoPushTicket[]> {
        try {
            // Filtrar tokens válidos
            const validTokens = pushTokens.filter(token => Expo.isExpoPushToken(token));

            if (validTokens.length === 0) {
                console.warn('⚠️ No valid push tokens found');
                return [];
            }

            const messages: ExpoPushMessage[] = validTokens.map(token => ({
                to: token,
                sound: 'default',
                title,
                body,
                data: data || {},
                priority: 'high',
            }));

            console.log(`📤 Sending ${messages.length} push notifications`);

            // Dividir en chunks de 100 (límite de Expo)
            const chunks = expo.chunkPushNotifications(messages);
            const tickets: ExpoPushTicket[] = [];

            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    console.error('❌ Error sending chunk:', error);
                }
            }

            console.log(`✅ Sent ${tickets.length} notifications`);

            return tickets;
        } catch (error) {
            console.error('❌ Error sending push notifications:', error);
            return [];
        }
    }

    /**
     * Notificación para nuevo mensaje de chat
     */
    static async notifyNewChatMessage(
        recipientPushToken: string,
        senderName: string,
        messageContent: string,
        conversationId: number,
        senderId: number
    ): Promise<boolean> {
        const title = `💬 ${senderName}`;
        const body = messageContent.length > 100
            ? messageContent.substring(0, 97) + '...'
            : messageContent;

        return await this.sendPushNotification(
            recipientPushToken,
            title,
            body,
            {
                type: 'chat_message',
                conversationId: conversationId.toString(),
                senderId: senderId.toString(),
                senderName
            }
        );
    }

    /**
     * Notificación para nuevo comentario en post
     */
    static async notifyNewPostComment(
        recipientPushToken: string,
        commenterName: string,
        commentContent: string,
        postId: number
    ): Promise<boolean> {
        const title = `💭 ${commenterName} comentó tu publicación`;
        const body = commentContent.length > 100
            ? commentContent.substring(0, 97) + '...'
            : commentContent;

        return await this.sendPushNotification(
            recipientPushToken,
            title,
            body,
            {
                type: 'post_comment',
                postId: postId.toString(),
                senderName: commenterName
            }
        );
    }
}
