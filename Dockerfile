FROM node:20-slim

WORKDIR /app

COPY hiring-tracker/package*.json ./
RUN npm ci --only=production

COPY hiring-tracker/ ./

EXPOSE 3001
ENV NODE_ENV=production

CMD ["node", "server.js"]
