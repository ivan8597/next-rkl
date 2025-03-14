import { bookSeat, initRedis } from './redis.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Временное хранилище пользователей
const users = new Map();

export const getPrice = (row: number, type: string): number => {
  if (type === 'airplane') {
    return row <= 2 ? 15000 : row <= 5 ? 10000 : 7000;
  } else if (type === 'concert') {
    return row <= 3 ? 8000 : row <= 8 ? 5000 : 3000;
  }
  return row <= 2 ? 500 : 300; // cinema
};

export const getCategory = (row: number, type: string): string => {
  if (type === 'airplane') {
    return row <= 2 ? 'vip' : row <= 5 ? 'standard' : 'economy';
  } else if (type === 'concert') {
    return row <= 3 ? 'vip' : row <= 8 ? 'standard' : 'economy';
  }
  return row <= 2 ? 'vip' : 'standard'; // cinema
};

const generateSeats = (type: string) => {
  const seats = [];
  const rows = type === 'airplane' ? 10 : type === 'concert' ? 15 : 5;
  const seatsPerRow = type === 'airplane' ? 6 : type === 'concert' ? 8 : 3;

  for (let row = 1; row <= rows; row++) {
    for (let number = 1; number <= seatsPerRow; number++) {
      seats.push({
        id: `${type}-${row}-${number}`,
        row,
        number,
        status: 'available',
        type,
        price: getPrice(row, type),
        category: getCategory(row, type)
      });
    }
  }
  return seats;
};

export const resolvers = {
  Query: {
    seats: async (_: any, { type }: { type: string }) => {
      const redis = await initRedis();
      const generatedSeats = generateSeats(type);
      const actualSeats = [];
      
      for (const seat of generatedSeats) {
        const seatKey = `seat:${seat.id}`;
        const existingSeat = await redis.get(seatKey);
        if (!existingSeat) {
          await redis.set(seatKey, JSON.stringify(seat));
          actualSeats.push(seat);
        } else {
          const parsedSeat = JSON.parse(existingSeat);
          if (!parsedSeat.id) {
            parsedSeat.id = seat.id;
          }
          if (!parsedSeat.row) {
            parsedSeat.row = seat.row;
          }
          if (!parsedSeat.number) {
            parsedSeat.number = seat.number;
          }
          if (!parsedSeat.status) {
            parsedSeat.status = 'available';
          }
          if (!parsedSeat.type) {
            parsedSeat.type = type;
          }
          if (!parsedSeat.price) {
            parsedSeat.price = getPrice(parsedSeat.row, type);
          }
          if (!parsedSeat.category) {
            parsedSeat.category = getCategory(parsedSeat.row, type);
          }
          actualSeats.push(parsedSeat);
        }
      }
      return actualSeats;
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
    bookSeats: async (_: any, { seatIds, type }: { seatIds: string[], type: string }, context: any) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }

      if (seatIds.length > 4) {
        throw new Error('Нельзя забронировать больше 4 мест одновременно');
      }

      const redis = await initRedis();

      // Проверим существование мест перед бронированием
      for (const seatId of seatIds) {
        const seatKey = `seat:${seatId}`;
        const existingSeat = await redis.get(seatKey);
        if (!existingSeat) {
          // Если места нет в Redis, создадим его
          const [seatType, row, number] = seatId.split('-');
          const rowNum = parseInt(row);
          const numNum = parseInt(number);
          const newSeat = {
            id: seatId,
            row: rowNum,
            number: numNum,
            status: 'available',
            type: seatType,
            price: getPrice(rowNum, seatType),
            category: getCategory(rowNum, seatType)
          };
          await redis.set(seatKey, JSON.stringify(newSeat));
        }
      }

      const bookedSeats = [];
      for (const seatId of seatIds) {
        const bookedSeat = await bookSeat(seatId, context.user.id, type);
        bookedSeats.push(bookedSeat);
      }
      
      return bookedSeats;
    },
  },
};