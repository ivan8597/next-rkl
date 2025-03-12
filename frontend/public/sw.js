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
    title: 'Booking Update',
    body: 'There has been an update to your booking'
  };

  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/badge.png',
    data: data,
    actions: [
      {
        action: 'view',
        title: 'View Booking'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  
  if (event.action === 'view') {
    clients.openWindow('/booking');
  } else {
    clients.openWindow('/');
  }
  
  event.notification.close();
}); 