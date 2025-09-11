# Примеры тестирования Notes API

Этот файл содержит примеры команд для тестирования всех эндпоинтов Notes API.

## Предварительные требования

1. Приложение должно быть запущено на `http://localhost:8080`
2. Установлен `curl` для выполнения HTTP запросов

## Запуск приложения

```bash
# В директории kotlin-notes-app
./gradlew run
```

## Тестирование эндпоинтов

### 1. Проверка работы сервера

```bash
# Получить информацию о сервере
curl -X GET http://localhost:8080/

# Проверить здоровье сервера
curl -X GET http://localhost:8080/health
```

**Ожидаемый ответ:**

```json
{
  "message": "Notes API сервер работает",
  "version": "1.0.0",
  "endpoints": [...]
}
```

### 2. Получить все заметки (изначально пустой список)

```bash
curl -X GET http://localhost:8080/notes \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ:**

```json
[]
```

### 3. Создать новую заметку

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя первая заметка"}'
```

**Ожидаемый ответ (201 Created):**

```json
{
    "id": 1,
    "text": "Моя первая заметка",
    "createdAt": "2024-01-15 10:30:00"
}
```

### 4. Создать еще несколько заметок

```bash
# Вторая заметка
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Купить продукты"}'

# Третья заметка
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Позвонить врачу"}'
```

### 5. Получить все заметки (теперь должны быть заметки)

```bash
curl -X GET http://localhost:8080/notes \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ:**

```json
[
    {
        "id": 3,
        "text": "Позвонить врачу",
        "createdAt": "2024-01-15 10:32:00"
    },
    {
        "id": 2,
        "text": "Купить продукты",
        "createdAt": "2024-01-15 10:31:00"
    },
    {
        "id": 1,
        "text": "Моя первая заметка",
        "createdAt": "2024-01-15 10:30:00"
    }
]
```

### 6. Получить заметку по ID

```bash
curl -X GET http://localhost:8080/notes/1 \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ (200 OK):**

```json
{
    "id": 1,
    "text": "Моя первая заметка",
    "createdAt": "2024-01-15 10:30:00"
}
```

### 7. Обновить заметку

```bash
curl -X PUT http://localhost:8080/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя обновленная первая заметка"}'
```

**Ожидаемый ответ (200 OK):**

```json
{
    "id": 1,
    "text": "Моя обновленная первая заметка",
    "createdAt": "2024-01-15 10:30:00"
}
```

### 8. Удалить заметку

```bash
curl -X DELETE http://localhost:8080/notes/2 \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ:** `204 No Content` (пустое тело ответа)

## Тестирование валидации

### 1. Попытка создать заметку с пустым текстом

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

**Ожидаемый ответ (400 Bad Request):**

```json
{
    "error": "Текст заметки не может быть пустым"
}
```

### 2. Попытка создать заметку со слишком длинным текстом

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "'$(python3 -c "print('a' * 501)")'"}'
```

**Ожидаемый ответ (400 Bad Request):**

```json
{
    "error": "Текст заметки не может превышать 500 символов"
}
```

### 3. Попытка получить несуществующую заметку

```bash
curl -X GET http://localhost:8080/notes/999 \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ (404 Not Found):**

```json
{
    "error": "Заметка с ID 999 не найдена"
}
```

### 4. Попытка обновить несуществующую заметку

```bash
curl -X PUT http://localhost:8080/notes/999 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленный текст"}'
```

**Ожидаемый ответ (404 Not Found):**

```json
{
    "error": "Заметка с ID 999 не найдена"
}
```

### 5. Попытка удалить несуществующую заметку

```bash
curl -X DELETE http://localhost:8080/notes/999 \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ (404 Not Found):**

```json
{
    "error": "Заметка с ID 999 не найдена"
}
```

## Тестирование с неверными данными

### 1. Неверный формат JSON

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Заметка без закрывающей кавычки}'
```

**Ожидаемый ответ (400 Bad Request):**

```json
{
    "error": "Внутренняя ошибка сервера: ..."
}
```

### 2. Неверный ID в URL

```bash
curl -X GET http://localhost:8080/notes/abc \
  -H "Content-Type: application/json"
```

**Ожидаемый ответ (400 Bad Request):**

```json
{
    "error": "Неверный формат ID"
}
```

## Полный сценарий тестирования

```bash
#!/bin/bash

echo "=== Полное тестирование Notes API ==="

# 1. Проверка сервера
echo "1. Проверка работы сервера..."
curl -s http://localhost:8080/health

# 2. Создание заметок
echo -e "\n2. Создание заметок..."
curl -s -X POST http://localhost:8080/notes -H "Content-Type: application/json" -d '{"text": "Первая заметка"}'
curl -s -X POST http://localhost:8080/notes -H "Content-Type: application/json" -d '{"text": "Вторая заметка"}'

# 3. Получение всех заметок
echo -e "\n3. Получение всех заметок..."
curl -s http://localhost:8080/notes

# 4. Обновление заметки
echo -e "\n4. Обновление заметки..."
curl -s -X PUT http://localhost:8080/notes/1 -H "Content-Type: application/json" -d '{"text": "Обновленная первая заметка"}'

# 5. Удаление заметки
echo -e "\n5. Удаление заметки..."
curl -s -X DELETE http://localhost:8080/notes/2

# 6. Финальная проверка
echo -e "\n6. Финальная проверка заметок..."
curl -s http://localhost:8080/notes

echo -e "\n=== Тестирование завершено ==="
```

Сохраните этот скрипт как `full-test.sh` и выполните:

```bash
chmod +x full-test.sh
./full-test.sh
```
