import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initRedis } from './redis';
import { initKafka } from './kafka';
import jwt from 'jsonwebtoken';

const app = express();

// Инициализируем сервисы
async function init() {
  try {
    await initRedis();
    console.log('Redis инициализирован');
    
    await initKafka();
    console.log('Kafka инициализирован');
  } catch (err) {
    console.error('Ошибка инициализации:', err);
  }
}

// Запускаем инициализацию
init();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

await server.start();

app.use(
  '/graphql',
  cors({
    origin: ['http://localhost:3000', 'http://frontend:3000'],
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return {};

      try {
        const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return { user };
      } catch {
        return {};
      }
    },
  }),
);

app.listen(4000, () => {
  console.log('Сервер готов по адресу http://localhost:4000/graphql');
});