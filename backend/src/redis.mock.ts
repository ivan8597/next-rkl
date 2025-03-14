import { RedisClientType } from 'redis';

const seats = new Map();

function generateSeats(type: string) {
  const rows = type === 'airplane' ? 10 : type === 'concert' ? 15 : 5;
  const seatsPerRow = type === 'airplane' ? 6 : type === 'concert' ? 8 : 3;
  const seatsArray = [];

  for (let row = 1; row <= rows; row++) {
    for (let number = 1; number <= seatsPerRow; number++) {
      const id = `${type}-${row}-${number}`;
      seatsArray.push({
        id,
        row,
        number,
        status: 'available',
        type
      });
    }
  }
  return seatsArray;
}

const mockRedis: RedisClientType = {
  connect: async () => Promise.resolve(),
  get: async (key: string) => {
    if (!seats.has(key)) {
      const [_, type] = key.split(':');
      seats.set(key, JSON.stringify(generateSeats(type)));
    }
    return seats.get(key);
  },
  set: async (key: string, value: string) => {
    seats.set(key, value);
    return 'OK';
  },
  disconnect: async () => Promise.resolve()
} as any;

export default function createClient() {
  return mockRedis;
} 