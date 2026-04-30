FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
