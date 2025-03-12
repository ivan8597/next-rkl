import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'booking-app',
  brokers: ['localhost:9092'],
});

const producer = kafka.producer();

export async function initKafka() {
  await producer.connect();
}

export async function sendBookingMessage(seat: any) {
  await producer.send({
    topic: 'bookings',
    messages: [{ value: JSON.stringify(seat) }],
  });
}