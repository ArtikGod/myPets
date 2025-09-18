FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npm prune --production

EXPOSE 3000

RUN echo -e '#!/bin/sh\nnpm run migrate\nnpm start' > /app/start.sh && chmod +x /app/start.sh

CMD ["sh", "/app/start.sh"]