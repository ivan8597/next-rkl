import webpush from 'web-push';
import { vapidKeys } from './vapid-keys.js';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function sendPushNotification(subscription: webpush.PushSubscription, data: any) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(data));
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
} 