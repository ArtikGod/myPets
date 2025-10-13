FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && npm cache clean --force

COPY . .

RUN npm run build
RUN npx prisma generate

EXPOSE 3001

USER node

CMD ["npm", "start"]