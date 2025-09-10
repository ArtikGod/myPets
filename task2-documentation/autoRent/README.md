# AutoRent API - Система аренды автомобилей

Полнофункциональное REST API для системы аренды автомобилей с интеграцией Telegram бота, построенное на Node.js, Express, MongoDB и TypeScript.

## 🚀 Возможности

-   **Управление пользователями** - регистрация, авторизация, управление водительскими удостоверениями
-   **Каталог автомобилей** - добавление, редактирование, фильтрация и сортировка
-   **Система бронирования** - создание, отмена, статистика бронирований
-   **Telegram интеграция** - уведомления и управление через бота
-   **Swagger документация** - интерактивная API документация
-   **Полное тестирование** - unit, integration и performance тесты
-   **TypeScript** - типизированный код для надежности

## 📋 Требования

-   **Node.js** >= 16.0.0
-   **MongoDB** >= 4.4
-   **npm** >= 8.0.0

## 🛠 Установка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd autoRent
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка окружения

Скопируйте шаблон переменных окружения и настройте его:

```bash
cp .env.template .env
```

Отредактируйте файл `.env` и укажите ваши настройки:

```env
# База данных
DB_CONNECTION_STRING=mongodb://localhost:27017/auto

# Сервер
PORT=3200

# Telegram Bot (опционально)
TG_BOT_TOKEN=your_telegram_bot_token
ADMIN_TG_IDS=your_telegram_id
ADMIN_DB_USER_ID=your_mongodb_user_id
```

**Обязательные переменные:**
- `DB_CONNECTION_STRING` - строка подключения к MongoDB
- `PORT` - порт сервера (по умолчанию 3200)

**Опциональные переменные:**
- `TG_BOT_TOKEN` - токен Telegram бота
- `ADMIN_TG_IDS` - ID администраторов в Telegram
- `ADMIN_DB_USER_ID` - ID администратора в базе данных

### 4. Запуск MongoDB

Убедитесь, что MongoDB запущен:

```bash
# macOS (с Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

## 🚀 Запуск

### Режим разработки

```bash
npm run dev
# или
npm start
```

Сервер будет доступен по адресу: `http://localhost:3200`

### Проверка работоспособности

```bash
curl http://localhost:3200/health
```

Ожидаемый ответ:

```json
{
    "status": "OK",
    "message": "Server is running"
}
```

## 📚 API Документация

### Swagger UI

После запуска сервера, интерактивная документация доступна по адресу:

```
http://localhost:3200/api-docs
```

### Основные endpoints

#### Health Check

-   `GET /health` - Проверка состояния сервера

#### Пользователи

-   `POST /users` - Создать пользователя
-   `POST /users/licens` - Добавить водительское удостоверение
-   `GET /users/{id}` - Получить пользователя
-   `PUT /users/{id}` - Обновить пользователя
-   `DELETE /users/{id}` - Удалить пользователя

#### Автомобили

-   `POST /vehicle` - Создать автомобиль
-   `GET /vehicle` - Получить список автомобилей (с фильтрацией)
-   `GET /vehicle/{vehicleId}` - Получить автомобиль
-   `PUT /vehicle/{vehicleId}` - Обновить автомобиль
-   `DELETE /vehicle/{vehicleId}` - Удалить автомобиль

#### Бронирования

-   `POST /reservations` - Создать бронирование
-   `GET /reservations/` - История бронирований
-   `GET /reservations/{vehicleId}` - Проверить доступность
-   `PUT /reservations/{reservationsId}` - Обновить бронирование
-   `PUT /reservations/cancel/{reservationsId}` - Отменить бронирование
-   `GET /reservations/statistic/completed` - Статистика завершенных
-   `GET /reservations/statistic/users` - Статистика пользователей

## 🔐 Авторизация

Большинство endpoints требуют авторизации через заголовок `authorization`:

```bash
curl -H "authorization: 507f1f77bcf86cd799439011" \
     http://localhost:3200/users/507f1f77bcf86cd799439011
```

Значение должно быть валидным MongoDB ObjectId (24 символа).

## 💡 Примеры использования

### Создание пользователя

```bash
curl -X POST http://localhost:3200/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Добавление автомобиля

```bash
curl -X POST http://localhost:3200/vehicle \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "price": 2500.50,
    "photo": "https://example.com/car.jpg"
  }'
```

### Создание бронирования

```bash
curl -X POST http://localhost:3200/reservations \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "vehicleId": "507f1f77bcf86cd799439012",
    "leaseStart": "2024-01-15",
    "leaseEnd": "2024-01-20"
  }'
```

### Фильтрация автомобилей

```bash
# По цене и году
curl "http://localhost:3200/vehicle?minPrice=1000&maxPrice=5000&minYear=2020&maxYear=2023"

# С сортировкой
curl "http://localhost:3200/vehicle?sort_by=price&order=asc"
```

## 🧪 Тестирование

### Все тесты

```bash
npm test
```

### Отдельные типы тестов

```bash
# Unit тесты
npm run test:unit

# Integration тесты
npm run test:integration

# Тесты с покрытием
npm run test:cov

# Performance тесты
npm run test:performance
```

### Performance тестирование

```bash
# Отдельные модули
npm run test:performance:vehicle
npm run test:performance:users
npm run test:performance:reservations

# Комплексный тест
npm run test:performance:all

# Все performance тесты
npm run test:performance:full
```

## 📁 Структура проекта

```
autoRent/
├── src/
│   ├── app.ts                 # Основное приложение Express
│   ├── server.ts              # Точка входа сервера
│   ├── swagger.ts             # Конфигурация Swagger
│   ├── connectdb.ts           # Подключение к MongoDB
│   ├── middleware.ts          # Middleware функции
│   ├── utils.ts               # Утилиты
│   ├── constants.ts           # Константы
│   ├── routes.ts              # Основные маршруты
│   ├── telegrambot.ts         # Telegram бот
│   ├── users/                 # Модуль пользователей
│   │   ├── userModel.ts
│   │   ├── userService.ts
│   │   └── userRoutes.ts
│   ├── vehicle/               # Модуль автомобилей
│   │   ├── vehicleModel.ts
│   │   ├── vehicleService.ts
│   │   └── vehicleRoutes.ts
│   └── reservations/          # Модуль бронирований
│       ├── reservationsModel.ts
│       ├── reservationsService.ts
│       └── reservationsRoutes.ts
├── __tests__/                 # Тесты
│   ├── unit/                  # Unit тесты
│   ├── integration/           # Integration тесты
│   └── performance/           # Performance тесты
├── coverage/                  # Отчеты покрытия
├── .env                       # Переменные окружения
├── package.json
├── tsconfig.json
├── jest.config.ts
└── README.md
```

## 🔧 Конфигурация

### TypeScript

Проект использует строгую конфигурацию TypeScript с поддержкой ES2020 и декораторов.

### Jest

Настроен для unit, integration и performance тестирования с поддержкой TypeScript.

### MongoDB

Использует Mongoose для работы с MongoDB с автоматическим подключением.

## 🤖 Telegram Bot

Бот поддерживает:

-   Уведомления о новых бронированиях
-   Административные команды
-   Интеграцию с основным API

Для активации укажите `TG_BOT_TOKEN` в `.env` файле.

## 📊 Мониторинг и метрики

### Performance метрики

-   **RPS**: > 80-100 для GET операций
-   **Latency**: < 500ms для простых запросов
-   **Error rate**: < 5%

### Покрытие тестами

Цель: > 80% покрытие кода

```bash
npm run test:cov
```

## 🚨 Troubleshooting

### Проблема: Сервер не запускается

**Решения:**

1. Проверьте, что MongoDB запущен
2. Убедитесь, что порт 3200 свободен
3. Проверьте переменные окружения в `.env`

```bash
# Проверка MongoDB
mongosh --eval "db.runCommand('ping')"

# Проверка порта
lsof -i :3200
```

### Проблема: Ошибки подключения к базе данных

**Решения:**

1. Проверьте строку подключения в `.env`
2. Убедитесь, что MongoDB доступен
3. Проверьте права доступа

```bash
# Тест подключения
mongosh mongodb://localhost:27017/auto
```

### Проблема: Swagger UI не загружается

**Решения:**

1. Убедитесь, что сервер запущен
2. Проверьте URL: `http://localhost:3200/api-docs`
3. Очистите кэш браузера

### Проблема: Тесты падают

**Решения:**

1. Убедитесь, что тестовая база данных доступна
2. Проверьте переменные окружения для тестов
3. Запустите тесты по отдельности для диагностики

```bash
# Отладка конкретного теста
npm test -- --testNamePattern="specific test name"
```

### Проблема: Низкая производительность

**Решения:**

1. Проверьте индексы в MongoDB
2. Оптимизируйте запросы к базе данных
3. Увеличьте connection pool

```bash
# Анализ производительности
npm run test:performance
```

### Проблема: Telegram бот не работает

**Решения:**

1. Проверьте токен бота в `.env`
2. Убедитесь, что бот активен в BotFather
3. Проверьте права доступа

## 🤝 Разработка

### Добавление новых endpoints

1. Создайте маршрут в соответствующем файле routes
2. Добавьте JSDoc комментарии для Swagger
3. Напишите тесты
4. Обновите документацию

### Стиль кода

Проект использует:

-   TypeScript strict mode
-   ESLint для линтинга
-   Prettier для форматирования

### Git workflow

1. Создайте feature branch
2. Напишите тесты
3. Реализуйте функциональность
4. Убедитесь, что все тесты проходят
5. Создайте pull request

## 📄 Лицензия

ISC License

## 📞 Поддержка

-   **Email**: support@autorent.com
-   **API Документация**: http://localhost:3200/api-docs
-   **GitHub Issues**: для сообщения о багах

---

**Версия**: 1.0.0  
**Последнее обновление**: 2024
