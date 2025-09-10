# Notes API - RESTful веб-приложение на Go

RESTful веб-приложение для управления заметками, написанное на Go с использованием SQLite в качестве базы данных.

## Архитектура

Приложение построено с использованием модульной архитектуры:

-   **cmd/server** - Точка входа приложения
-   **internal/model** - Модели данных и валидация
-   **internal/db** - Подключение к SQLite базе данных
-   **internal/repository** - Слой доступа к данным
-   **internal/service** - Бизнес-логика
-   **internal/handler** - HTTP обработчики

## Функциональность

### API Endpoints

-   `GET /notes` - Получить все заметки
-   `POST /notes` - Создать новую заметку
-   `PUT /notes/{id}` - Обновить заметку по ID
-   `DELETE /notes/{id}` - Удалить заметку по ID
-   `GET /health` - Проверка состояния сервера

### Валидация

-   Текст заметки не может быть пустым
-   Максимальная длина текста: 500 символов
-   ID должен быть положительным числом

## Установка и запуск

### Требования

-   Go 1.21 или выше
-   SQLite3

### Установка зависимостей

```bash
go mod tidy
```

### Запуск приложения

```bash
go run cmd/server/main.go
```

Сервер запустится на порту 8080.

## Примеры использования

### Создание заметки

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя первая заметка"}'
```

### Получение всех заметок

```bash
curl http://localhost:8080/notes
```

### Обновление заметки

```bash
curl -X PUT http://localhost:8080/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная заметка"}'
```

### Удаление заметки

```bash
curl -X DELETE http://localhost:8080/notes/1
```

### Проверка состояния

```bash
curl http://localhost:8080/health
```

## Структура проекта

```
noteapp/
├── cmd/
│   └── server/
│       └── main.go          # Точка входа
├── internal/
│   ├── db/
│   │   └── sqlite.go        # Подключение к БД
│   ├── handler/
│   │   └── note_handler.go  # HTTP обработчики
│   ├── model/
│   │   ├── note.go          # Модели данных
│   │   └── errors.go        # Ошибки
│   ├── repository/
│   │   └── note_repository.go # Репозиторий
│   └── service/
│       └── note_service.go  # Бизнес-логика
├── go.mod                   # Зависимости
└── README.md               # Документация
```

## База данных

Приложение автоматически создает SQLite базу данных `notes.db` в корневой директории при первом запуске.

### Схема таблицы notes

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Обработка ошибок

-   **400 Bad Request** - Неверный формат данных или валидация не пройдена
-   **404 Not Found** - Заметка не найдена
-   **500 Internal Server Error** - Внутренняя ошибка сервера

## Технологии

-   **Go 1.21** - Язык программирования
-   **Chi v5** - HTTP роутер
-   **SQLite3** - База данных
-   **mattn/go-sqlite3** - SQLite драйвер для Go
