import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initRedis } from './redis';
import jwt from 'jsonwebtoken';

const app = express();
await initRedis();
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
  console.log('Server ready at http://localhost:4000/graphql');
});