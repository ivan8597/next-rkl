import { bookSeat, initRedis } from './redis.js';
import { sendBookingMessage } from './kafka.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Временное хранилище пользователей (в реальном приложении используйте базу данных)
const users = new Map();

const generateSeats = (type: string) => {
  const seats = [];
  const rows = type === 'airplane' ? 10 : type === 'concert' ? 15 : 5;
  const seatsPerRow = type === 'airplane' ? 6 : type === 'concert' ? 8 : 3;

  for (let row = 1; row <= rows; row++) {
    for (let number = 1; number <= seatsPerRow; number++) {
      seats.push({
        id: (row - 1) * seatsPerRow + number,
        row,
        number,
        status: 'available',
        type
      });
    }
  }
  return seats;
};

export const resolvers = {
  Query: {
    seats: async (_: any, { type }: { type: string }) => {
      const redis = await initRedis();
      const seatsKey = `seats:${type}`;
      
      let seats = await redis.get(seatsKey);
      if (!seats) {
        seats = JSON.stringify(generateSeats(type));
        await redis.set(seatsKey, seats);
      }
      
      return JSON.parse(seats);
    },
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    }
  },
  Mutation: {
    signIn: async (_: any, { email, password }: { email: string, password: string }) => {
      const user = users.get(email);
      if (!user) {
        throw new Error('User not found');
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    },
    signUp: async (_: any, { email, password, name }: { email: string, password: string, name?: string }) => {
      if (users.has(email)) {
        throw new Error('User already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: Date.now().toString(),
        email,
        password: hashedPassword,
        name: name || email
      };

      users.set(email, user);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '1d' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    },
    bookSeats: async (_: any, { seatIds, type }: { seatIds: number[], type: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (seatIds.length > 4) {
        throw new Error('Нельзя забронировать больше 4 мест одновременно');
      }

      const bookedSeats = [];
      for (const seatId of seatIds) {
        // Сначала получаем место и проверяем его статус
        const redis = await initRedis();
        const seatsKey = `seats:${type}`;
        const seatsData = await redis.get(seatsKey);
        if (!seatsData) {
          throw new Error('Seats not found');
        }
        const seats = JSON.parse(seatsData);
        const seat = seats.find((s: any) => s.id === seatId);
        
        if (seat.status === 'booked') {
          throw new Error('Место уже забронировано');
        }
        
        // Если место свободно, бронируем его
        const bookedSeat = await bookSeat(seatId, context.user.id, type);
        bookedSeats.push(bookedSeat);
        await sendBookingMessage(bookedSeat);
      }
      
      return bookedSeats;
    },
  },
};