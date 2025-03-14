'use client';

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push-уведомления не поддерживаются');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker зарегистрирован');

    const response = await fetch('/api/vapid-key');
    if (!response.ok) throw new Error('Не удалось получить VAPID ключ');
    
    const { publicKey } = await response.json();

    // Проверяем существующую подписку
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe(); // Удаляем старую подписку
      console.log('Отписан от предыдущей подписки');
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey
    });

    const result = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    if (!result.ok) throw new Error('Failed to subscribe');
    
    console.log('Успешно подписан на push-уведомления');
  } catch (error) {
    console.error('Ошибка при подписке на push-уведомления:', error);
  }
}