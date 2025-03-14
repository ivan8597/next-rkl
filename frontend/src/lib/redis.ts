import { Seat } from '../types/index';

export async function bookSeat(seatId: number): Promise<Seat | null> {
  try {
    const response = await fetch(`/api/seats/${seatId}/book`, {
      method: 'POST',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Ошибка при бронировании места:', error);
    return null;
  }
} 