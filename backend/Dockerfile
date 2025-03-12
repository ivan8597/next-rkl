FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY src/ .
EXPOSE 4000
CMD ["npx", "ts-node", "src/index.ts"]