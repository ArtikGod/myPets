# 🍽️ Бронирование столиков

Простое приложение для бронирования столиков в ресторанах. Создано на микросервисах и Kafka.

## Что это?

Два сервиса:

- **API** - принимает заявки на бронирование
- **Booking Service** - обрабатывает заявки через Kafka

## Как запустить?

### Быстро (с Docker)

```bash
# Скопировать настройки
cp .env.example .env

# Запустить всё
docker-compose up -d

# Проверить что работает
curl http://localhost:3000/bookings
```

### Для разработки

```bash
# Установить зависимости
cd api-service && npm install
cd ../booking-service && npm install

# Запустить только базу и Kafka
docker-compose up postgres kafka zookeeper -d

# Запустить сервисы
npm run start:dev # в api-service
npm run start:dev # в booking-service (в другом терминале)
```

## Как пользоваться?

### Создать бронирование

```bash
curl -X POST http://localhost:3000/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": 1,
    "bookingDate": "2024-01-15",
    "bookingTime": "19:30",
    "guestCount": 4
  }'
```

### Посмотреть бронирования

```bash
# Все бронирования
curl http://localhost:3000/bookings

# Конкретное бронирование
curl http://localhost:3000/bookings/1
```

### Swagger документация

Открыть в браузере: http://localhost:3000/api/docs

## Что внутри?

- **NestJS** - фреймворк
- **PostgreSQL** - база данных
- **Kafka** - очередь сообщений
- **TypeORM** - работа с базой
- **Docker** - контейнеры

## Если что-то не работает

```bash
# Посмотреть логи
docker-compose logs -f

# Перезапустить всё
docker-compose down
docker-compose up -d

# Подключиться к базе
docker-compose exec postgres psql -U postgres -d booking_db
```
