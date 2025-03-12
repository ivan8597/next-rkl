FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV REDIS_URL=redis://redis:6379
ENV KAFKA_BROKER=kafka:29092
ENV JWT_SECRET=your-secret-key

EXPOSE 4000
CMD ["npm", "start"]