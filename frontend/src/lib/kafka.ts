import { Seat } from '@/types';

export async function sendBookingMessage(seat: Seat): Promise<void> {
  try {
    await fetch('/api/booking/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seat),
    });
  } catch (error) {
    console.error('Error sending booking message:', error);
  }
} 