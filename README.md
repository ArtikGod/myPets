# ERP.AERO Express REST API

REST API сервис с JWT авторизацией и управлением файлами.

## Возможности

-   JWT авторизация с access (10 мин) и refresh токенами (7 дней)
-   Управление файлами (загрузка, скачивание, удаление, обновление)
-   Пагинация списка файлов
-   Поддержка нескольких устройств для одного пользователя
-   CORS настроен для любого домена
-   Валидация всех входных данных

## Установка

1. Установите зависимости:

```bash
npm install
```

2. Создайте базу данных MySQL и выполните скрипт инициализации:

```bash
mysql -u root -p < db_init.sql
```

3. Создайте файл `.env` на основе `.env.example` и настройте параметры подключения к БД.

4. Запустите сервер:

```bash
npm start
# или для разработки
npm run dev
```

## Тестирование

Запуск юнит тестов:

```bash
npm test
# или в режиме наблюдения
npm run test:watch
```

Тесты покрывают:

-   Валидацию данных (ValidationService)
-   Аутентификацию и авторизацию (Auth middleware)
-   Управление сессиями (SessionService)
-   API эндпоинты (интеграционные тесты)
-   Обработку ошибок (Error Handler)

## API Endpoints

### Авторизация

-   `POST /signup` - Регистрация нового пользователя
-   `POST /signin` - Авторизация по ID и паролю
-   `POST /signin/new_token` - Обновление JWT токена по refresh токену
-   `GET /logout` - Выход из системы
-   `GET /info` - Возвращает ID пользователя

### Файлы (требуют авторизации)

-   `POST /file/upload` - Загрузка файла
-   `GET /file/list` - Список файлов с пагинацией
-   `GET /file/:id` - Информация о файле
-   `GET /file/download/:id` - Скачивание файла
-   `PUT /file/update/:id` - Обновление файла
-   `DELETE /file/delete/:id` - Удаление файла

## Параметры запросов

### Регистрация/Авторизация

```json
{
    "id": "user@example.com или +79001234567",
    "password": "password123"
}
```

### Обновление токена

```json
{
    "refreshToken": "your_refresh_token"
}
```

### Пагинация файлов

-   `page` - номер страницы (по умолчанию 1)
-   `list_size` - размер страницы (по умолчанию 10)

## Структура ответов

### Успешная авторизация

```json
{
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "message": "User registered successfully"
}
```

### Список файлов

```json
{
    "files": [
        {
            "id": 1,
            "name": "document.pdf",
            "extension": "pdf",
            "mime_type": "application/pdf",
            "size": 1024,
            "upload_date": "2023-01-01T12:00:00.000Z"
        }
    ],
    "pagination": {
        "page": 1,
        "listSize": 10,
        "totalPages": 5,
        "totalFiles": 50
    }
}
```

## Переменные окружения

Создайте файл `.env` со следующими параметрами:

```env
PORT=3000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_key
REFRESH_SECRET=your_refresh_secret_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=file_storage
DB_PORT=3306
```

> > > > > > > b7aa64cf (REST API with JWT authentication and file management and tests)
