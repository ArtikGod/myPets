URL Shortener
Простой сервис для сокращения URL с аналитикой переходов.

Описание
Это веб-приложение, позволяющее создавать короткие URL, управлять ими и получать статистику переходов. Backend написан на Node.js с использованием Express и TypeORM, база данных PostgreSQL. Frontend — React с Vite.

Функциональность
Создание коротких URL с возможностью задать кастомный алиас и срок действия

Перенаправление с короткого URL на оригинальный

Просмотр всех сохраненных URL

Получение статистики переходов и последних IP-адресов

Удаление коротких URL

Обработка ошибок и валидация

Технологии
Backend:

Node.js, Express

TypeScript

TypeORM, PostgreSQL

http-status для удобной работы с HTTP-кодами

Frontend:

React (функциональные компоненты, хуки)

TypeScript

Vite

Другие:

Docker и Docker Compose 

Nginx для проксирования и отдачи фронтенда

Структура проекта

/backend         - backend сервис (Express + TypeORM)
/frontend        - frontend на React + Vite
/nginx           - конфигурация nginx для проксирования
/docker-compose.yml - (опционально) для запуска всего стека

Установка и запуск

1. Установка зависимостей
Backend
cd backend
npm install
Frontend
cd frontend
npm install

2. Настройка базы данных
Запусти PostgreSQL (локально или в Docker)

Создай базу данных и пользователя

Сконфигурируй доступ в backend/config/db.ts

3. Запуск backend
cd backend
npm run build
npm start
или в режиме разработки
npm run dev

4. Запуск frontend
cd frontend
npm run dev

5. Запуск с Nginx 
Помести собранный фронтенд в /usr/share/nginx/html

Используй конфигурацию nginx из /nginx/nginx.conf

Настрой проксирование запросов /api, /urls, /analytics на backend

Тестирование
Backend покрыт интеграционными тестами с использованием Jest и Supertest:

cd backend
npm run test
Использование API

POST /urls/shorten — создание короткого URL

GET /urls — список всех URL

GET /urls/info/:shortUrl — информация о коротком URL

DELETE /urls/delete/:shortUrl — удалить URL

GET /analytics/:shortUrl — аналитика переходов по URL

GET /:shortUrl — редирект на оригинальный URL

Примеры запросов
Создание короткого URL:

POST /urls/shorten
{
  "originalUrl": "https://example.com",
  "alias": "customalias",
  "expiresAt": "2025-12-31T23:59:59.000Z"
}

Константы и статусы
Для работы с HTTP статусами использована библиотека http-status.

Лицензия
MIT