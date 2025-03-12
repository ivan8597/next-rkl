// Версия Service Worker для кэширования
const CACHE_VERSION = 'v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
});

self.addEventListener('push', (event) => {
  console.log('Push notification received', event);

  const data = event.data?.json() ?? {
    title: 'Default Title',
    body: 'Default message'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      badge: '/badge.png'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
}); 