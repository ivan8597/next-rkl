import createClient from './redis.mock';
import { getPrice, getCategory } from './resolvers';
import { sendBookingEvent } from './kafka';

export const redis = createClient();

export async function initRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

export async function bookSeat(seatId: string, userId: string, type: string) {
  const seatData = await redis.get(`seat:${seatId}`);
  
  if (!seatData) {
   
    const [seatType, rowStr, numberStr] = seatId.split('-');
    const rowNum = parseInt(rowStr);
    const numNum = parseInt(numberStr);
    const newSeat = {
      id: seatId,
      row: rowNum,
      number: numNum,
      status: 'available',
      type: seatType,
      price: getPrice(rowNum, seatType),
      category: getCategory(rowNum, seatType)
    };
    await redis.set(`seat:${seatId}`, JSON.stringify(newSeat));
    return bookSeat(seatId, userId, type); // Рекурсивно вызываем для бронирования
  }

  const seat = JSON.parse(seatData);
  if (seat.status === 'booked') {
    throw new Error('Seat already booked');
  }

  const updatedSeat = {
    id: seatId,
    row: seat.row || parseInt(seatId.split('-')[1]),
    number: seat.number || parseInt(seatId.split('-')[2]),
    status: 'booked',
    type: type,
    userId: userId,
    expiresIn: Math.floor(Date.now() / 1000) + 900, // 15 минут
    price: seat.price || getPrice(seat.row || parseInt(seatId.split('-')[1]), type),
    category: seat.category || getCategory(seat.row || parseInt(seatId.split('-')[1]), type)
  };

  await redis.set(`seat:${seatId}`, JSON.stringify(updatedSeat));
  
  // Отправляем событие в Kafka
  try {
    await sendBookingEvent(seatId, userId);
  } catch (error) {
    console.error('Не удалось отправить событие Kafka:', error);
  }
  
  return updatedSeat;
}

export async function getSeat(seatId: string) {
  const seatData = await redis.get(`seat:${seatId}`);
  if (!seatData) {
    throw new Error('Место не найдено');
  }
  return JSON.parse(seatData);
}