'use server';

import { bookSeat } from '@/lib/redis';
import { sendBookingMessage } from '@/lib/kafka';
import { Seat } from '@/types';

export async function bookSeats(seatIds: number[]) {
  const bookedSeats: Seat[] = [];
  for (const seatId of seatIds) {
    const seat = await bookSeat(seatId);
    if (seat) {
      bookedSeats.push(seat);
      await sendBookingMessage(seat);
    }
  }
  if (bookedSeats.length === 0) {
    throw new Error('No seats were booked');
  }
  return bookedSeats;
}