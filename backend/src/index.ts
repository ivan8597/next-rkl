import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initRedis } from './redis';
import { initKafka } from './kafka';
import jwt from 'jsonwebtoken';

// Создаем PubSub для публикации и подписки на события
export const pubsub = new PubSub();

const app = express();
const httpServer = createServer(app);

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

// Создаем исполняемую схему
const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
  schema,
});

await server.start();

// Настраиваем WebSocket сервер
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Используем схему с WebSocket сервером
const serverCleanup = useServer({
  schema,
  context: async (ctx) => {
    const token = ctx.connectionParams?.authToken as string;
    if (!token) return {};

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      return { user };
    } catch {
      return {};
    }
  },
}, wsServer);

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

httpServer.listen(4000, () => {
  console.log('Сервер готов по адресу http://localhost:4000/graphql');
  console.log('WebSocket сервер готов по адресу ws://localhost:4000/graphql');
});