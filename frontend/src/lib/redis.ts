import { Seat } from '../types';

export async function bookSeat(seatId: number): Promise<Seat | null> {
  try {
    const response = await fetch(`/api/seats/${seatId}/book`, {
      method: 'POST',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error('Error booking seat:', error);
    return null;
  }
} 