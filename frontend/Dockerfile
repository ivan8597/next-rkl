FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV NEXT_PUBLIC_API_URL=http://localhost:4000

EXPOSE 3000
CMD ["npm", "start"]