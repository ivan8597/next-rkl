import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'booking-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:29092']
});

const producer = kafka.producer();

interface Seat {
  id: number;
  row: number;
  number: number;
  type: string;
  status: string;
  userId?: string;
  expiresIn?: number;
}

export async function initKafka() {
  await producer.connect();
}

export async function sendBookingMessage(seat: Seat) {
  await producer.send({
    topic: 'booking-events',
    messages: [{
      key: `${seat.type}-${seat.id}`,
      value: JSON.stringify({
        event: 'бронирование',
        seat: {
          id: seat.id,
          row: seat.row,
          number: seat.number,
          type: seat.type,
          status: seat.status,
          userId: seat.userId,
          expiresIn: seat.expiresIn
        },
        timestamp: new Date().toISOString()
      })
    }]
  });
}

export async function closeKafka() {
  await producer.disconnect();
}