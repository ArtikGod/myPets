# NestJS Server API

Полнофункциональный сервер на NestJS с REST API, WebSockets, аутентификацией JWT, загрузкой файлов и PostgreSQL базой данных.

## 🚀 Возможности

- **REST API** - полный CRUD для пользователей и файлов
- **WebSockets** - real-time коммуникация с аутентификацией
- **JWT аутентификация** - access и refresh токены
- **Загрузка файлов** - поддержка изображений и PDF (до 10MB)
- **PostgreSQL** - надежная база данных с Sequelize ORM
- **Swagger документация** - автоматическая генерация API документации
- **Docker поддержка** - готовые конфигурации для развертывания

## 📋 Требования

- Node.js 18+
- PostgreSQL 12+
- npm или yarn

## 🛠 Установка

### Локальная разработка

1. **Клонирование и установка зависимостей:**

```bash
git clone <repository-url>
cd nestjs-server
npm install
```

2. **Настройка переменных окружения:**

```bash
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

3. **Настройка базы данных:**

```bash
# Создайте базу данных PostgreSQL
createdb nestjs_server_db

# Запустите миграции (если есть)
npm run migration:run
```

4. **Запуск в режиме разработки:**

```bash
npm run start:dev
```

### Docker развертывание

1. **Настройка переменных окружения для Docker:**

```bash
cp .env.docker.example .env.docker
# Отредактируйте .env.docker файл с вашими настройками
```

2. **Запуск всех сервисов:**

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f app

# Остановка сервисов
docker-compose down

# Остановка с удалением volumes
docker-compose down -v
```

3. **Доступные сервисы:**

- **API сервер:** http://localhost:3000
- **Swagger документация:** http://localhost:3000/api/docs
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379
- **Adminer (DB админка):** http://localhost:8080

## 📚 API Документация

После запуска сервера, Swagger документация доступна по адресу:

- **Swagger UI:** http://localhost:3000/api/docs

### Основные эндпоинты

#### Аутентификация

- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `POST /auth/refresh` - Обновление токенов
- `GET /auth/profile` - Получение профиля (требует токен)
- `POST /auth/logout` - Выход из системы

#### Пользователи

- `GET /users` - Список пользователей (с пагинацией)
- `GET /users/me` - Текущий пользователь
- `GET /users/me/stats` - Статистика пользователя
- `GET /users/:id` - Пользователь по ID
- `PUT /users/:id` - Обновление пользователя
- `DELETE /users/:id` - Удаление пользователя

#### Файлы

- `POST /files/upload` - Загрузка одного файла
- `POST /files/upload-multiple` - Загрузка нескольких файлов
- `GET /files` - Список файлов пользователя
- `GET /files/stats` - Статистика файлов
- `GET /files/:id` - Информация о файле
- `GET /files/:id/download` - Скачивание файла
- `DELETE /files/:id` - Удаление файла
- `POST /files/cleanup` - Очистка потерянных файлов (админ)

## 🔌 WebSocket События

### Подключение

```javascript
const socket = io("http://localhost:3000", {
    auth: {
        token: "your-jwt-token",
    },
});
```

### События клиента

- `authenticate` - Аутентификация с токеном
- `join_room` - Присоединение к комнате
- `leave_room` - Покидание комнаты
- `send_message` - Отправка сообщения

### События сервера

- `authenticated` - Подтверждение аутентификации
- `authentication_error` - Ошибка аутентификации
- `joined_room` - Подтверждение присоединения к комнате
- `left_room` - Подтверждение покидания комнаты
- `new_message` - Новое сообщение в комнате
- `user_online` - Пользователь подключился
- `user_offline` - Пользователь отключился
- `file_uploaded` - Уведомление о загрузке файла
- `notification` - Персональное уведомление
- `broadcast_notification` - Общее уведомление для всех

## 🗄 Структура базы данных

### Таблицы

#### users

- `id` - PRIMARY KEY
- `email` - UNIQUE, NOT NULL
- `password` - NOT NULL (хешированный)
- `firstName` - VARCHAR
- `lastName` - VARCHAR
- `createdAt` - TIMESTAMP
- `updatedAt` - TIMESTAMP

#### files

- `id` - PRIMARY KEY
- `originalName` - NOT NULL
- `filename` - UNIQUE, NOT NULL
- `path` - NOT NULL
- `mimetype` - VARCHAR
- `size` - INTEGER
- `userId` - FOREIGN KEY (users.id)
- `createdAt` - TIMESTAMP
- `updatedAt` - TIMESTAMP

#### refresh_tokens

- `id` - PRIMARY KEY
- `token` - TEXT, NOT NULL
- `userId` - FOREIGN KEY (users.id)
- `expiresAt` - TIMESTAMP
- `createdAt` - TIMESTAMP
- `updatedAt` - TIMESTAMP

## 🔒 Безопасность

- **JWT токены** с коротким временем жизни (15 минут)
- **Refresh токены** для обновления сессий (7 дней)
- **Хеширование паролей** с bcrypt (12 rounds)
- **Валидация файлов** по типу и размеру
- **CORS настройки** для безопасности
