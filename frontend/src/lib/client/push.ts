'use client';

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('Push notifications not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered');

    const response = await fetch('/api/vapid-key');
    if (!response.ok) throw new Error('Failed to get VAPID key');
    
    const { publicKey } = await response.json();

    // Проверяем существующую подписку
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      await existingSubscription.unsubscribe(); // Удаляем старую подписку
      console.log('Unsubscribed from previous subscription');
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
    
    console.log('Successfully subscribed to push notifications');
  } catch (error) {
    console.error('Error subscribing to push:', error);
  }
}