import { Kafka } from 'kafkajs';
import createClient from './redis.mock';
import { pubsub } from './index.js';

const kafka = new Kafka({
  clientId: 'booking-service',
  brokers: [process.env.KAFKA_BROKER || 'kafka:29092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'booking-expiry-group' });

// Используем отдельное подключение к Redis для избежания циклической зависимости
const redis = createClient();
async function getRedisClient() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

let producerReady = false;

export async function initKafka() {
  await producer.connect();
  producerReady = true;
  await consumer.connect();
  
  // Создаем тему, если она не существует
  const admin = kafka.admin();
  await admin.connect();
  const topics = await admin.listTopics();
  
  if (!topics.includes('booking-expiry')) {
    await admin.createTopics({
      topics: [{ topic: 'booking-expiry', numPartitions: 1, replicationFactor: 1 }]
    });
    console.log('Created booking-expiry topic');
  }
  
  await admin.disconnect();
  
  await consumer.subscribe({ topic: 'booking-expiry', fromBeginning: true });
  
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (!message.value) return;
      
      const { seatId, userId, expiryTime } = JSON.parse(message.value.toString());
      console.log(`Processing expired booking: ${seatId} for user ${userId}`);
      
      // Проверяем, истекло ли время бронирования
      const now = Date.now();
      if (expiryTime > now) {
        const delayMs = expiryTime - now;
        console.log(`Booking for seat ${seatId} will expire in ${Math.round(delayMs/1000)} seconds`);
        
        // Планируем освобождение места через setTimeout
        setTimeout(async () => {
          try {
            const redisClient = await getRedisClient();
            const seatData = await redisClient.get(`seat:${seatId}`);
            
            if (seatData) {
              const seat = JSON.parse(seatData);
              
              // Проверяем, что место все еще забронировано пользователем
              if (seat.status === 'booked' && seat.userId === userId) {
                // Освобождаем место
                seat.status = 'available';
                delete seat.userId;
                delete seat.expiresIn;
                
                await redisClient.set(`seat:${seatId}`, JSON.stringify(seat));
                console.log(`Место ${seatId} освобождено из-за истечения срока`);
                
                // Публикуем событие обновления места
                pubsub.publish('SEAT_UPDATED', { 
                  seatUpdated: seat,
                  type: seat.type
                });
              }
            }
          } catch (error) {
            console.error(`Ошибка освобождения места ${seatId}:`, error);
          }
        }, delayMs);
        
        return;
      }
      
      const redisClient = await getRedisClient();
      const seatData = await redisClient.get(`seat:${seatId}`);
      
      if (seatData) {
        const seat = JSON.parse(seatData);
        
        // Проверяем, что место все еще забронировано этим пользователем
        if (seat.status === 'booked' && seat.userId === userId) {
          // Освобождаем место
          seat.status = 'available';
          delete seat.userId;
          delete seat.expiresIn;
          
          await redisClient.set(`seat:${seatId}`, JSON.stringify(seat));
          console.log(`Место ${seatId} освобождено из-за истечения срока`);
          
          // Публикуем событие обновления места
          pubsub.publish('SEAT_UPDATED', { 
            seatUpdated: seat,
            type: seat.type
          });
        }
      }
    },
  });
  
  return { producer, consumer };
}

export async function sendBookingEvent(seatId: string, userId: string) {
  if (!producerReady) {
    console.log('Kafka producer не готов, пропускаем событие');
    return;
  }
  
  const expiryTime = Date.now() + 15 * 60 * 1000; // 15 минут
  
  await producer.send({
    topic: 'booking-expiry',
    messages: [
      { 
        key: seatId,
        value: JSON.stringify({ seatId, userId, expiryTime }),
        headers: { 'event-type': 'booking-created' }
      },
    ],
  });
  
  console.log(`Отправлено событие бронирования для места ${seatId}`);
}
