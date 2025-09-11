# Swift Notes API

RESTful веб-приложение на Swift для управления заметками с использованием SQLite в качестве базы данных.

## Архитектура

Приложение построено с использованием модульной архитектуры:

-   **Models** - Модели данных и DTO
-   **Database** - Управление подключением к SQLite
-   **Repository** - Слой доступа к данным
-   **Services** - Бизнес-логика и валидация
-   **Handlers** - HTTP обработчики
-   **Main** - Точка входа и настройка роутинга

## Технологии

-   **Swift 5.9+**
-   **Vapor 4** - HTTP сервер и веб-фреймворк
-   **SQLite.swift** - Работа с базой данных SQLite
-   **Foundation** - Базовые типы данных

## Установка и запуск

### Требования

-   macOS 13.0+
-   Swift 5.9+
-   Xcode 15.0+

### Запуск

1. Клонируйте репозиторий:

```bash
git clone <repository-url>
cd swift-notes-app
```

2. Соберите и запустите приложение:

```bash
swift run
```

Сервер запустится на порту 8080.

## API Endpoints

### 1. Получить все заметки

```
GET /notes
```

**Ответ:**

```json
[
    {
        "id": 1,
        "text": "Моя первая заметка",
        "createdAt": "2024-01-15T10:30:00Z"
    }
]
```

### 2. Получить заметку по ID

```
GET /notes/{id}
```

**Ответ:**

```json
{
    "id": 1,
    "text": "Моя первая заметка",
    "createdAt": "2024-01-15T10:30:00Z"
}
```

### 3. Создать новую заметку

```
POST /notes
Content-Type: application/json

{
  "text": "Новая заметка"
}
```

**Ответ (201 Created):**

```json
{
    "id": 2,
    "text": "Новая заметка",
    "createdAt": "2024-01-15T10:35:00Z"
}
```

### 4. Обновить заметку

```
PUT /notes/{id}
Content-Type: application/json

{
  "text": "Обновленная заметка"
}
```

**Ответ:**

```json
{
    "id": 1,
    "text": "Обновленная заметка",
    "createdAt": "2024-01-15T10:30:00Z"
}
```

### 5. Удалить заметку

```
DELETE /notes/{id}
```

**Ответ:** 204 No Content

## Валидация

-   Текст заметки не может быть пустым
-   Максимальная длина текста: 500 символов
-   ID должен быть положительным числом

## Обработка ошибок

Все ошибки возвращаются в формате JSON:

```json
{
    "error": "ValidationError",
    "message": "Текст заметки не может быть пустым"
}
```

### HTTP статус коды:

-   `200` - Успешный запрос
-   `201` - Ресурс создан
-   `204` - Ресурс удален
-   `400` - Некорректный запрос
-   `404` - Ресурс не найден
-   `500` - Внутренняя ошибка сервера

## Тестирование

### Примеры curl команд:

1. **Получить все заметки:**

```bash
curl -X GET http://localhost:8080/notes
```

2. **Создать заметку:**

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Тестовая заметка"}'
```

3. **Получить заметку по ID:**

```bash
curl -X GET http://localhost:8080/notes/1
```

4. **Обновить заметку:**

```bash
curl -X PUT http://localhost:8080/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная заметка"}'
```

5. **Удалить заметку:**

```bash
curl -X DELETE http://localhost:8080/notes/1
```

## База данных

Приложение использует SQLite базу данных, которая создается автоматически при первом запуске.

**Структура таблицы `notes`:**

-   `id` - INTEGER PRIMARY KEY AUTOINCREMENT
-   `text` - TEXT NOT NULL
-   `created_at` - DATETIME NOT NULL

База данных сохраняется в директории Documents пользователя.

## Разработка

### Структура проекта:

```
Sources/App/
├── Models/
│   └── Note.swift
├── Database/
│   └── Database.swift
├── Repository/
│   └── NoteRepository.swift
├── Services/
│   └── NoteService.swift
├── Handlers/
│   └── NoteHandler.swift
└── main.swift
```

### Добавление новых функций:

1. Добавьте новые поля в модель `Note`
2. Обновите схему базы данных в `Database.swift`
3. Расширьте репозиторий для новых операций
4. Добавьте бизнес-логику в сервис
5. Создайте новые обработчики и роуты

## Лицензия

MIT License
