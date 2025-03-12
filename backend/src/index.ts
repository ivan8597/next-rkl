import express, { Express } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';
import { initRedis } from './redis.mock.js';  // .js остается в импорте
import { initKafka, sendBookingMessage } from './kafka.mock.js';

const app: Express = express();

// Настройка CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req, res }) => ({ req, res })
});

async function startServer() {
  await server.start();
  
  server.applyMiddleware({ 
    app: app as any,
    cors: false
  });

  await initRedis();
  await initKafka();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startServer().catch(console.error);

export { sendBookingMessage };  // Оставляем только sendBookingMessage