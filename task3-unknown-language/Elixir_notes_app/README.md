# NotesApp - RESTful API для управления заметками

RESTful веб-приложение на Elixir для управления заметками с использованием SQLite в качестве базы данных.

## Архитектура

Приложение построено по модульной архитектуре:

-   **main** (`lib/notes_app.ex`, `lib/notes_app/application.ex`) - Точка входа и инициализация сервера, базы данных и роутера
-   **handler** (`lib/notes_app/handler/note_handler.ex`) - HTTP обработчики для endpoints, обработка JSON и валидация
-   **service** (`lib/notes_app/service/note_service.ex`) - Бизнес-логика для CRUD операций
-   **repository** (`lib/notes_app/repository/note_repository.ex`) - Операции с базой данных
-   **model** (`lib/notes_app/model/note.ex`) - Структура сущности Note (ID, Text, CreatedAt)
-   **db** (`lib/notes_app/db.ex`) - Настройка SQLite соединения и создание таблиц

## API Endpoints

### GET /notes

Получить все заметки (отсортированы по дате создания, новые первыми)

**Ответ:**

```json
{
    "notes": [
        {
            "id": 1,
            "text": "Моя первая заметка",
            "created_at": "2024-01-01T12:00:00Z"
        }
    ]
}
```

### POST /notes

Создать новую заметку

**Запрос:**

```json
{
    "text": "Текст заметки"
}
```

**Ответ (201):**

```json
{
    "id": 1,
    "text": "Текст заметки",
    "created_at": "2024-01-01T12:00:00Z"
}
```

### PUT /notes/:id

Обновить существующую заметку

**Запрос:**

```json
{
    "text": "Обновленный текст заметки"
}
```

**Ответ (200):**

```json
{
    "id": 1,
    "text": "Обновленный текст заметки",
    "created_at": "2024-01-01T12:00:00Z"
}
```

### DELETE /notes/:id

Удалить заметку

**Ответ:** 204 No Content

## Валидация

-   Поле `text` обязательно
-   Текст не может быть пустым
-   Длина текста: от 1 до 500 символов
-   При ошибке валидации возвращается HTTP 400 с описанием ошибки

## Обработка ошибок

-   **400 Bad Request** - Неверные входные данные или ошибка валидации
-   **404 Not Found** - Заметка не найдена или неверный маршрут
-   **500 Internal Server Error** - Ошибка сервера или базы данных

Формат ошибки:

```json
{
    "error": "Описание ошибки"
}
```

## База данных

Структура таблицы `notes`:

```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Запуск приложения

Поскольку Elixir не установлен в системе, приложение создано в виде готовой структуры файлов.

Для запуска потребуется:

1. Установить Elixir и Erlang
2. Перейти в директорию проекта: `cd notes_app`
3. Установить зависимости: `mix deps.get`
4. Запустить приложение: `mix run --no-halt`

Сервер будет доступен по адресу: `http://localhost:4000`

## Примеры использования

```bash
# Получить все заметки
curl -X GET http://localhost:4000/notes

# Создать заметку
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя новая заметка"}'

# Обновить заметку
curl -X PUT http://localhost:4000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная заметка"}'

# Удалить заметку
curl -X DELETE http://localhost:4000/notes/1
```

## Зависимости

-   `plug_cowboy` - HTTP сервер
-   `plug` - Веб-фреймворк
-   `jason` - JSON кодирование/декодирование
-   `ecto_sql` - ORM для работы с базой данных
-   `ecto_sqlite3` - SQLite адаптер для Ecto
