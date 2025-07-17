FROM node:18-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./
RUN npm install

COPY backend/ ./

RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]

