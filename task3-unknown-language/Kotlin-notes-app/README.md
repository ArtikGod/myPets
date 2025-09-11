# Notes API - RESTful веб-приложение на Kotlin

RESTful веб-приложение для управления заметками, написанное на Kotlin с использованием Ktor и SQLite.

## Особенности

-   **Модульная архитектура** с разделением на слои (handler, service, repository, model, db)
-   **SQLite база данных** для хранения заметок
-   **Валидация входных данных** (текст заметки: 1-500 символов, не пустой)
-   **Обработка ошибок** с соответствующими HTTP статус-кодами
-   **JSON API** с автоматической сериализацией/десериализацией
-   **Логирование** операций и ошибок

## Структура проекта

```
kotlin-notes-app/
├── build.gradle.kts          # Конфигурация сборки
├── gradle.properties         # Настройки Gradle
├── README.md                 # Документация
└── src/main/kotlin/com/notes/
    ├── Main.kt               # Точка входа приложения
    ├── model/
    │   └── Note.kt           # Модели данных и DTO
    ├── db/
    │   └── Database.kt       # Настройка подключения к SQLite
    ├── repository/
    │   └── NoteRepository.kt # Операции с базой данных
    ├── service/
    │   └── NoteService.kt    # Бизнес-логика и валидация
    └── handler/
        └── NoteHandler.kt    # HTTP обработчики
```

## API Эндпоинты

### 1. Получить все заметки

```
GET /notes
```

**Ответ:** `200 OK`

```json
[
    {
        "id": 1,
        "text": "Моя первая заметка",
        "createdAt": "2024-01-15 10:30:00"
    }
]
```

### 2. Создать заметку

```
POST /notes
Content-Type: application/json

{
  "text": "Текст новой заметки"
}
```

**Ответ:** `201 Created`

```json
{
    "id": 1,
    "text": "Текст новой заметки",
    "createdAt": "2024-01-15 10:30:00"
}
```

### 3. Получить заметку по ID

```
GET /notes/{id}
```

**Ответ:** `200 OK` или `404 Not Found`

### 4. Обновить заметку

```
PUT /notes/{id}
Content-Type: application/json

{
  "text": "Обновленный текст заметки"
}
```

**Ответ:** `200 OK` или `404 Not Found`

### 5. Удалить заметку

```
DELETE /notes/{id}
```

**Ответ:** `204 No Content` или `404 Not Found`

## Валидация

-   Текст заметки не может быть пустым
-   Минимальная длина: 1 символ
-   Максимальная длина: 500 символов
-   При нарушении валидации возвращается `400 Bad Request`

## Запуск приложения

### Требования

-   Java 11 или выше
-   Gradle 7.0 или выше

### Сборка и запуск

```bash
# Перейти в директорию проекта
cd kotlin-notes-app

# Сборка проекта
./gradlew build

# Запуск приложения
./gradlew run
```

Сервер будет доступен по адресу: `http://localhost:8080`

### Проверка работы

```bash
# Проверка статуса сервера
curl http://localhost:8080/health

# Получить информацию о сервере
curl http://localhost:8080/
```

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

## База данных

Приложение автоматически создает SQLite базу данных `notes.db` в корневой директории проекта.

### Схема таблицы notes

```sql
CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Обработка ошибок

-   `400 Bad Request` - ошибки валидации или неверный формат данных
-   `404 Not Found` - заметка не найдена
-   `500 Internal Server Error` - внутренние ошибки сервера

Все ошибки возвращаются в формате:

```json
{
    "error": "Описание ошибки"
}
```

## Технологии

-   **Kotlin** - основной язык программирования
-   **Ktor** - веб-фреймворк для HTTP сервера
-   **SQLite** - встроенная база данных
-   **Kotlinx Serialization** - сериализация JSON
-   **JDBC** - подключение к базе данных
