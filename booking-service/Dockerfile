FROM node:18-alpine

WORKDIR /app

COPY ./booking-service/package*.json ./

COPY ./shared/package.json ../../../shared/

RUN npm install && npm cache clean --force

RUN cd ../../../shared && npm install && npm cache clean --force

COPY ./booking-service/src ./src
COPY ./booking-service/nest-cli.json ./
COPY ./booking-service/tsconfig.json ./

COPY ./shared ../../../shared

RUN npx nest build

CMD ["node", "dist/app/src/main.js"]