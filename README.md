# Психолог-бот с веб-версией

Минимальный жизнеспособный продукт (MVP) психологического помощника, который ежедневно отправляет пользователю задания для улучшения эмоционального состояния, фиксирует выполнение и отображает прогресс.

## 🚀 Функциональность

### Telegram-бот

-   **Регистрация**: При команде `/start` бот спрашивает имя и email
-   **Ежедневные задания**: Каждое утро (09:00) бот отправляет психологическое упражнение
-   **Отметка выполнения**: Команда `/done` отмечает задание как выполненное
-   **Прогресс**: Команда `/progress` показывает статистику выполнения
-   **Справка**: Команда `/help` показывает описание всех команд

### Backend API

-   **Технологии**: Node.js + Express + Prisma + PostgreSQL
-   **Аутентификация**: JWT токены с поддержкой cookie
-   **API эндпоинты**: Регистрация, авторизация, задания, прогресс
-   **Планировщик**: Автоматическое создание и отправка ежедневных заданий

### Веб-интерфейс

-   **Технология**: Next.js с TypeScript
-   **Пользовательский кабинет**: Просмотр заданий, история, статистика
-   **Админ-панель**: Управление пользователями и упражнениями
-   **Интернационализация**: Поддержка русского и английского языков

## 🏗️ Архитектура проекта

```
psychology-bot/
├── backend/                 # Express API сервер
│   ├── src/
│   │   ├── controllers/     # Контроллеры API
│   │   ├── services/        # Бизнес-логика
│   │   ├── routes/          # API роуты
│   │   ├── middleware/      # Middleware функции
│   │   ├── utils/           # Утилиты
│   │   └── types/           # TypeScript типы
│   ├── prisma/              # Схема базы данных
│   └── tests/               # Unit тесты
├── bot/                     # Telegram бот
│   ├── src/
│   │   ├── handlers/        # Обработчики команд
│   │   ├── services/        # Сервисы бота
│   │   └── utils/           # Утилиты
├── frontend/                # Next.js веб-приложение
│   ├── src/
│   │   ├── pages/           # Страницы
│   │   ├── components/      # React компоненты
│   │   ├── services/        # API сервисы
│   │   └── locales/         # Переводы
├── docker-compose.yml       # Docker конфигурация
└── .env.example            # Пример переменных окружения
```

## 🛠️ Технологический стек

### Backend

-   **Node.js** + **TypeScript**
-   **Express.js** - веб-фреймворк
-   **Prisma** - ORM для работы с БД
-   **PostgreSQL** - база данных
-   **JWT** - аутентификация
-   **bcrypt** - хеширование паролей
-   **node-cron** - планировщик задач

### Bot

-   **Telegraf** - Telegram Bot Framework
-   **axios** - HTTP клиент для API

### Frontend

-   **Next.js 14** - React фреймворк
-   **TypeScript** - типизация
-   **Tailwind CSS** - стилизация
-   **React Hook Form** - формы
-   **React Query** - управление состоянием API
-   **next-i18next** - интернационализация

### DevOps

-   **Docker** + **Docker Compose**
-   **ESLint** + **Prettier** - линтинг

## 🚀 Быстрый старт

### Предварительные требования

-   Node.js 18+
-   Docker и Docker Compose
-   PostgreSQL (или используйте Docker)

### 1. Клонирование и настройка

```bash
# Клонируйте репозиторий
git clone <repository-url>
cd psychology-bot

# Скопируйте файл окружения
cp .env.example .env

# Отредактируйте .env файл с вашими настройками
```

### 2. Настройка переменных окружения

Отредактируйте файл `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/psychology_bot"

# Telegram Bot
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"

# JWT
JWT_SECRET_KEY="your_super_secret_jwt_key_here"

# Admin credentials
ADMIN_EMAIL="admin@psychology-bot.com"
ADMIN_PASSWORD="admin_password_here"

# Frontend
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# OpenAI (опционально)
OPENAI_API_KEY="your_openai_api_key_here"
```

### 3. Запуск с Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

### 4. Запуск для разработки

```bash
# Установка зависимостей для всех модулей
npm install
cd backend && npm install
cd ../bot && npm install
cd ../frontend && npm install
cd ..

# Запуск базы данных
docker-compose up -d postgres

# Настройка базы данных
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..

# Запуск всех сервисов в режиме разработки
npm run dev
```

## 📊 API Endpoints

### Аутентификация

-   `POST /api/auth/register` - Регистрация пользователя
-   `POST /api/auth/login` - Авторизация
-   `POST /api/auth/telegram` - Регистрация через Telegram
-   `GET /api/auth/me` - Получение текущего пользователя

### Задания

-   `GET /api/tasks/today` - Получение задания дня
-   `GET /api/tasks/history` - История заданий
-   `POST /api/tasks/:id/complete` - Отметка выполнения
-   `GET /api/progress` - Статистика прогресса

### Админ панель

-   `GET /api/admin/users` - Список пользователей
-   `GET /api/admin/stats` - Статистика системы
-   `POST /api/exercises` - Создание упражнения
-   `PUT /api/exercises/:id` - Обновление упражнения

## 🤖 Команды Telegram-бота

-   `/start` - Регистрация и приветствие
-   `/help` - Справка по командам
-   `/today` - Получить задание на сегодня
-   `/done [номер]` - Отметить задание как выполненное
-   `/progress` - Просмотр прогресса
-   `/settings` - Настройки (язык, время отправки)
-   `/custom` - Управление пользовательскими заданиями

## 🧘 Базовые упражнения

1. **Медитация осознанности** - 5-минутная практика концентрации на дыхании
2. **Дневник благодарности** - запись 3 вещей, за которые благодарны
3. **Дыхательная практика 4-7-8** - техника расслабления
4. **Позитивные аффирмации** - повторение утверждений о себе
5. **Прогрессивная мышечная релаксация** - поочередное напряжение и расслабление мышц
6. **Визуализация успеха** - представление достижения целей
7. **Практика самосострадания** - упражнение на принятие себя
8. **Анализ эмоций** - определение и описание текущих чувств
9. **Техника заземления 5-4-3-2-1** - упражнение против тревоги
10. **Письмо будущему себе** - написание послания через год

## 🔒 Безопасность

-   Пароли хешируются с помощью bcrypt
-   JWT токены с истечением срока действия
-   CORS настройки для безопасности
-   Rate limiting для API
-   Валидация всех входных данных
-   Роли пользователей (user/admin)

## 🧪 Тестирование

```bash
# Запуск тестов backend
cd backend
npm test

# Запуск тестов с покрытием
npm run test:coverage

# Запуск тестов в watch режиме
npm run test:watch
```

## 📝 Разработка

### Структура базы данных

```sql
-- Пользователи
User {
  id: String (PK)
  telegramId: String? (Unique)
  name: String
  email: String (Unique)
  password: String?
  role: Role (USER/ADMIN)
  locale: String
  timezone: String
  isActive: Boolean
}

-- Упражнения
Exercise {
  id: String (PK)
  title: String
  titleEn: String?
  description: String
  descriptionEn: String?
  category: String
  categoryEn: String?
  order: Int
  isActive: Boolean
}

-- Задания
Task {
  id: String (PK)
  userId: String (FK)
  exerciseId: String (FK)
  text: String
  textEn: String?
  date: DateTime
  status: TaskStatus (PENDING/COMPLETED/SKIPPED)
  completedAt: DateTime?
}
```

### Добавление нового упражнения

1. Добавьте упражнение через админ-панель или API
2. Упражнение автоматически включится в ротацию
3. Пользователи получат его согласно порядку

### Локализация

Добавление нового языка:

1. Добавьте язык в `SUPPORTED_LOCALES`
2. Создайте файлы переводов в `frontend/locales/`
3. Добавьте переводы упражнений в базу данных

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 🆘 Поддержка

Если у вас есть вопросы или проблемы:

1. Проверьте [Issues](../../issues) на GitHub
2. Создайте новый Issue с подробным описанием
3. Для срочных вопросов свяжитесь с командой разработки

## 🔄 Changelog

### v1.0.0 (Текущая версия)

-   ✅ Базовая функциональность Telegram-бота
-   ✅ Backend API с аутентификацией
-   ✅ Веб-интерфейс с админ-панелью
-   ✅ Система ежедневных заданий
-   ✅ Интернационализация (RU/EN)
-   ✅ Docker поддержка
-   ✅ Базовый набор психологических упражнений

### Планируемые функции

-   🔄 AI генерация упражнений
-   🔄 Расширенная аналитика
-   🔄 Мобильное приложение
-   🔄 Интеграция с календарем
-   🔄 Социальные функции
