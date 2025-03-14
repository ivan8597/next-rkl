import webpush from 'web-push';
import { vapidKeys } from './vapid-keys.js';

webpush.setVapidDetails(
  'mailto:ivan8597@yandex.ru',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function sendPushNotification(subscription: webpush.PushSubscription, data: any) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(data));
  } catch (error) {
    console.error('Ошибка при отправке push-уведомления:', error);
    throw error;
  }
} 