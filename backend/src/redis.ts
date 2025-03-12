import createClient from './redis.mock.js';
import { RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function initRedis() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    await redisClient.connect();
  }
  return redisClient;
}

export const bookSeat = async (seatId: number, userId: string, type: string) => {
  const redis = await initRedis();
  const seatsKey = `seats:${type}`;
  
  const seatsData = await redis.get(seatsKey);
  if (!seatsData) {
    throw new Error('Seats not found');
  }

  const seats = JSON.parse(seatsData);
  
  const seatIndex = seats.findIndex((seat: any) => seat.id === seatId);
  if (seats[seatIndex].status === 'booked') {
    throw new Error('Место уже забронировано');
  }

  seats[seatIndex].status = 'booked';
  seats[seatIndex].userId = userId;
  seats[seatIndex].expiresIn = Math.floor(Date.now() / 1000) + 900; // 15 минут
  
  await redis.set(seatsKey, JSON.stringify(seats));
  await redis.set(`booking:${type}:${seatId}`, userId);
  
  return seats[seatIndex];
};

export const getSeat = async (seatId: number, type: string = 'cinema') => {
  const redis = await initRedis();
  const seatsKey = `seats:${type}`;
  
  const seatsData = await redis.get(seatsKey);
  if (!seatsData) {
    throw new Error('Seats not found');
  }

  const seats = JSON.parse(seatsData);
  const seat = seats.find((s: any) => s.id === seatId);
  
  if (!seat) {
    throw new Error('Seat not found');
  }

  return seat;
};