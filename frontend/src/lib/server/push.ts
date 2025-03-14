import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:example@yourdomain.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

console.log('Сгенерированные VAPID ключи:', vapidKeys); // Для отладки

export { webpush, vapidKeys }; 