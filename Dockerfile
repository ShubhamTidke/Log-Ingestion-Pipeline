FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY package.json ./
RUN npm install --omit=dev

# Install client dependencies and build the React app
COPY client/package.json ./client/
RUN npm install --prefix client

COPY client ./client
RUN npm run build --prefix client

# Copy server source
COPY src ./src

RUN chown -R node:node /app
USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "src/server.js"]
