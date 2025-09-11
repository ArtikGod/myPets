# Примеры тестирования API

Этот файл содержит примеры запросов для тестирования всех эндпоинтов Notes API.

## Предварительные требования

1. Запустите сервер:

```bash
cargo run
```

2. Сервер будет доступен по адресу: `http://localhost:3030`

## Тестовые сценарии

### 1. Создание заметки

```bash
curl -X POST http://localhost:3030/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя первая заметка для тестирования"}'
```

**Ожидаемый результат:** HTTP 201 Created

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Моя первая заметка для тестирования",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

### 2. Получение всех заметок

```bash
curl http://localhost:3030/notes
```

**Ожидаемый результат:** HTTP 200 OK

```json
[
    {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "text": "Моя первая заметка для тестирования",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
]
```

### 3. Получение заметки по ID

Замените `{id}` на реальный ID из предыдущего ответа:

```bash
curl http://localhost:3030/notes/550e8400-e29b-41d4-a716-446655440000
```

**Ожидаемый результат:** HTTP 200 OK

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Моя первая заметка для тестирования",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

### 4. Обновление заметки

```bash
curl -X PUT http://localhost:3030/notes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленный текст заметки"}'
```

**Ожидаемый результат:** HTTP 200 OK

```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "text": "Обновленный текст заметки",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T11:45:00Z"
}
```

### 5. Удаление заметки

```bash
curl -X DELETE http://localhost:3030/notes/550e8400-e29b-41d4-a716-446655440000
```

**Ожидаемый результат:** HTTP 200 OK

```json
{
    "message": "Заметка успешно удалена"
}
```

## Тестирование валидации

### Тест 1: Пустой текст заметки

```bash
curl -X POST http://localhost:3030/notes \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

**Ожидаемый результат:** HTTP 400 Bad Request

```json
{
    "error": "Текст заметки не может быть пустым"
}
```

### Тест 2: Слишком длинный текст (более 500 символов)

```bash
curl -X POST http://localhost:3030/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "'"$(python3 -c "print('a' * 501)")"'"}'
```

**Ожидаемый результат:** HTTP 400 Bad Request

```json
{
    "error": "Текст заметки не может быть длиннее 500 символов"
}
```

### Тест 3: Текст только из пробелов

```bash
curl -X POST http://localhost:3030/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "   "}'
```

**Ожидаемый результат:** HTTP 400 Bad Request

```json
{
    "error": "Текст заметки не может быть пустым"
}
```

## Тестирование ошибок

### Тест 1: Получение несуществующей заметки

```bash
curl http://localhost:3030/notes/00000000-0000-0000-0000-000000000000
```

**Ожидаемый результат:** HTTP 404 Not Found

```json
{
    "error": "Заметка не найдена"
}
```

### Тест 2: Обновление несуществующей заметки

```bash
curl -X PUT http://localhost:3030/notes/00000000-0000-0000-0000-000000000000 \
  -H "Content-Type: application/json" \
  -d '{"text": "Новый текст"}'
```

**Ожидаемый результат:** HTTP 404 Not Found

```json
{
    "error": "Заметка не найдена"
}
```

### Тест 3: Удаление несуществующей заметки

```bash
curl -X DELETE http://localhost:3030/notes/00000000-0000-0000-0000-000000000000
```

**Ожидаемый результат:** HTTP 404 Not Found

```json
{
    "error": "Заметка не найдена"
}
```

### Тест 4: Неверный формат UUID

```bash
curl http://localhost:3030/notes/invalid-uuid
```

**Ожидаемый результат:** HTTP 400 Bad Request или 404 Not Found

## Полный тестовый сценарий

Выполните следующие команды последовательно для полного тестирования:

```bash
# 1. Создать заметку
NOTE_RESPONSE=$(curl -s -X POST http://localhost:3030/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Тестовая заметка"}')

echo "Создана заметка: $NOTE_RESPONSE"

# 2. Извлечь ID заметки (требует jq)
NOTE_ID=$(echo $NOTE_RESPONSE | jq -r '.id')
echo "ID заметки: $NOTE_ID"

# 3. Получить все заметки
curl -s http://localhost:3030/notes | jq

# 4. Получить заметку по ID
curl -s http://localhost:3030/notes/$NOTE_ID | jq

# 5. Обновить заметку
curl -s -X PUT http://localhost:3030/notes/$NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная тестовая заметка"}' | jq

# 6. Удалить заметку
curl -s -X DELETE http://localhost:3030/notes/$NOTE_ID | jq

# 7. Проверить, что заметка удалена
curl -s http://localhost:3030/notes/$NOTE_ID | jq
```

## Примечания

-   Замените `{id}` на реальные UUID из ответов API
-   Для красивого форматирования JSON используйте `jq`: `curl ... | jq`
-   Все временные метки возвращаются в формате ISO 8601 UTC
-   ID заметок генерируются автоматически как UUID v4
