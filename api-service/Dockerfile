FROM node:18-alpine

WORKDIR /app

COPY ./api-service/package*.json ./

COPY ./shared/package.json ../../../shared/

RUN npm install && npm cache clean --force

RUN cd ../../../shared && npm install && npm cache clean --force

COPY ./api-service/src ./src
COPY ./api-service/nest-cli.json ./
COPY ./api-service/tsconfig.json ./

COPY ./shared ../../../shared

RUN npx nest build

EXPOSE 3000

CMD ["node", "dist/app/src/main.js"]