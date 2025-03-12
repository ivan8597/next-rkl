import { createClient } from 'redis';

const client = createClient();

export async function initRedis() {
  await client.connect();
}

export async function bookSeat(seatId: number) {
  const key = `seat:${seatId}`;
  const status = await client.get(key);
  if (status === 'booked') return null;

  await client.set(key, 'booked');
  return { id: seatId, row: 'A', number: seatId, status: 'booked' };
}