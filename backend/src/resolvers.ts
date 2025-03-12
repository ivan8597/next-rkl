// import { bookSeat } from './redis.js';  // Удаляем импорт Redis
import { bookSeat } from './redis.mock.js';  // Использовать мок версию
import { sendBookingMessage } from './kafka.mock.js';

export const resolvers = {
  Query: {
    seats: async (_: any, { type }: { type: string }) => {
      // Заглушка вместо Redis
      return [
        { id: 1, row: 'A', number: 1, status: 'available' },
        { id: 2, row: 'A', number: 2, status: 'booked' },
      ];
    },
  },
  Mutation: {
    bookSeats: async (_: any, { seatIds }: { seatIds: number[] }) => {
      // Временная заглушка без Redis
      const bookedSeats = seatIds.map(id => ({
        id,
        row: 'A',
        number: id,
        status: 'booked'
      }));
      
      for (const seat of bookedSeats) {
        await sendBookingMessage(seat);
      }
      
      return bookedSeats;
    },
  },
};