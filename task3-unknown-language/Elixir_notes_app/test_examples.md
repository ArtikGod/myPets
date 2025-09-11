# Примеры тестирования API

Поскольку Elixir не установлен в системе, вот примеры команд для тестирования API после запуска приложения.

## Тестирование с помощью curl

### 1. Получить все заметки (пустой список)

```bash
curl -X GET http://localhost:4000/notes
```

Ожидаемый ответ:

```json
{ "notes": [] }
```

### 2. Создать новую заметку

```bash
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя первая заметка"}'
```

Ожидаемый ответ (201):

```json
{
    "id": 1,
    "text": "Моя первая заметка",
    "created_at": "2024-01-01T12:00:00Z"
}
```

### 3. Создать заметку с валидацией (слишком длинный текст)

```bash
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "'$(python3 -c "print('a' * 501)")'"}'
```

Ожидаемый ответ (400):

```json
{
    "error": "Text must be 500 characters or less"
}
```

### 4. Создать заметку с пустым текстом

```bash
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

Ожидаемый ответ (400):

```json
{
    "error": "Text cannot be empty"
}
```

### 5. Создать заметку без поля text

```bash
curl -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{}'
```

Ожидаемый ответ (400):

```json
{
    "error": "Text field is required"
}
```

### 6. Получить все заметки (с данными)

```bash
curl -X GET http://localhost:4000/notes
```

Ожидаемый ответ:

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

### 7. Обновить заметку

```bash
curl -X PUT http://localhost:4000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная заметка"}'
```

Ожидаемый ответ (200):

```json
{
    "id": 1,
    "text": "Обновленная заметка",
    "created_at": "2024-01-01T12:00:00Z"
}
```

### 8. Обновить несуществующую заметку

```bash
curl -X PUT http://localhost:4000/notes/999 \
  -H "Content-Type: application/json" \
  -d '{"text": "Новый текст"}'
```

Ожидаемый ответ (404):

```json
{
    "error": "Note not found"
}
```

### 9. Обновить заметку с неверным ID

```bash
curl -X PUT http://localhost:4000/notes/abc \
  -H "Content-Type: application/json" \
  -d '{"text": "Новый текст"}'
```

Ожидаемый ответ (400):

```json
{
    "error": "Invalid note ID"
}
```

### 10. Удалить заметку

```bash
curl -X DELETE http://localhost:4000/notes/1
```

Ожидаемый ответ: 204 No Content (пустое тело ответа)

### 11. Удалить несуществующую заметку

```bash
curl -X DELETE http://localhost:4000/notes/999
```

Ожидаемый ответ (404):

```json
{
    "error": "Note not found"
}
```

### 12. Обращение к несуществующему маршруту

```bash
curl -X GET http://localhost:4000/invalid
```

Ожидаемый ответ (404):

```json
{
    "error": "Not found"
}
```

## Тестирование с помощью HTTPie (альтернатива curl)

```bash
# Получить все заметки
http GET localhost:4000/notes

# Создать заметку
http POST localhost:4000/notes text="Новая заметка"

# Обновить заметку
http PUT localhost:4000/notes/1 text="Обновленная заметка"

# Удалить заметку
http DELETE localhost:4000/notes/1
```

## Полный сценарий тестирования

```bash
#!/bin/bash

echo "=== Тестирование Notes API ==="

echo "1. Получение пустого списка заметок:"
curl -s -X GET http://localhost:4000/notes | jq

echo -e "\n2. Создание первой заметки:"
curl -s -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Первая заметка"}' | jq

echo -e "\n3. Создание второй заметки:"
curl -s -X POST http://localhost:4000/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Вторая заметка"}' | jq

echo -e "\n4. Получение всех заметок:"
curl -s -X GET http://localhost:4000/notes | jq

echo -e "\n5. Обновление первой заметки:"
curl -s -X PUT http://localhost:4000/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная первая заметка"}' | jq

echo -e "\n6. Удаление второй заметки:"
curl -s -X DELETE http://localhost:4000/notes/2

echo -e "\n7. Финальный список заметок:"
curl -s -X GET http://localhost:4000/notes | jq

echo -e "\n=== Тестирование завершено ==="
```
