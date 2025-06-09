# 📝 Qtim — Pet-проект на NestJS

Простой REST API для управления статьями с аутентификацией, кэшированием и полнофункциональным CRUD.

## 🚀 Стек технологий

- **NestJS** + **TypeScript**
- **PostgreSQL** + **TypeORM**
- **Redis** — кэширование
- **JWT** — авторизация
- **Jest** — unit-тесты

## 📦 Основной функционал

- ✅ Регистрация и вход пользователей (JWT)
- ✅ CRUD API для сущности "Статья" (название, описание, дата, автор)
- ✅ Пагинация и фильтрация (по автору и дате публикации)
- ✅ Защита маршрутов создания/редактирования — только для авторизованных
- ✅ Кэширование запросов на статьи
- ✅ Инвалидация кэша при изменении или удалении статьи

## ⚙️ Быстрый старт

1. Установить зависимости:
   ```bash
   npm install
   ```

Настроить переменные окружения .env:

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=qtim
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret

Запустить миграции:

npm run typeorm:migration:run

Запустить проект:

npm run start:dev

📌 Примеры API
POST /auth/register — регистрация пользователя

{
"email": "user@example.com",
"password": "securepassword",
"name": "John Doe1"
}

POST /auth/login — логин (ответ содержит accessToken)

{
"email": "user@exampqle.com",
"password": "password1213"
}

GET /articles — список статей (с пагинацией, фильтрацией)

GET /articles/:id — одна статья

POST /articles — создать статью (только авторизованные)

PATCH /articles/:id — обновить статью (только авторизованные)

DELETE /articles/:id — удалить статью

Защищённые маршруты требуют JWT-токен в заголовке:
Authorization: Bearer <token>

🧪 Тестирование
Запуск unit-тестов:

npm run test

📁 Структура проекта

src/
├── auth/ # Модули авторизации
├── articles/ # CRUD статьи + кэширование
├── common/ # DTO, Guards, декораторы
├── config/ # Конфигурация .env, константы
├── database/ # Подключение к БД
├── entities/ # Определения сущностей/моделей базы данных
├── main.ts # Точка входа

🧠 Возможности для улучшения
E2E-тесты

Swagger-документация

💬 Готов к обсуждению архитектуры и доработке проекта при необходимости.
