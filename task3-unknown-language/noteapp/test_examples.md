# Примеры тестирования API

## Установка Go

Перед запуском приложения необходимо установить Go:

### macOS

```bash
brew install go
```

### Linux

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install golang-go

# CentOS/RHEL
sudo yum install golang
```

### Windows

Скачайте установщик с официального сайта: https://golang.org/dl/

## Запуск приложения

```bash
cd test/TZ/noteGo/noteapp
go mod tidy
go run cmd/server/main.go
```

## Тестирование API

После запуска сервера на порту 8080, можно протестировать следующие запросы:

### 1. Проверка состояния сервера

```bash
curl http://localhost:8080/health
```

Ожидаемый ответ:

```json
{ "status": "ok" }
```

### 2. Получение всех заметок (изначально пустой список)

```bash
curl http://localhost:8080/notes
```

Ожидаемый ответ:

```json
[]
```

### 3. Создание новой заметки

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя первая заметка"}'
```

Ожидаемый ответ:

```json
{
    "id": 1,
    "text": "Моя первая заметка",
    "created_at": "2024-01-01T12:00:00Z"
}
```

### 4. Получение всех заметок (с созданной заметкой)

```bash
curl http://localhost:8080/notes
```

Ожидаемый ответ:

```json
[
    {
        "id": 1,
        "text": "Моя первая заметка",
        "created_at": "2024-01-01T12:00:00Z"
    }
]
```

### 5. Обновление заметки

```bash
curl -X PUT http://localhost:8080/notes/1 \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная заметка"}'
```

Ожидаемый ответ:

```json
{
    "id": 1,
    "text": "Обновленная заметка",
    "created_at": "2024-01-01T12:00:00Z"
}
```

### 6. Удаление заметки

```bash
curl -X DELETE http://localhost:8080/notes/1
```

Ожидаемый ответ: HTTP 204 No Content

### 7. Тестирование валидации

#### Пустой текст

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": ""}'
```

Ожидаемый ответ:

```json
{ "error": "text cannot be empty" }
```

#### Слишком длинный текст (более 500 символов)

```bash
curl -X POST http://localhost:8080/notes \
  -H "Content-Type: application/json" \
  -d '{"text": "'$(python3 -c "print('a' * 501)")'"}'
```

Ожидаемый ответ:

```json
{ "error": "text cannot be longer than 500 characters" }
```

#### Несуществующая заметка

```bash
curl -X PUT http://localhost:8080/notes/999 \
  -H "Content-Type: application/json" \
  -d '{"text": "Тест"}'
```

Ожидаемый ответ:

```json
{ "error": "Note not found" }
```

## Проверка базы данных

После создания заметок, в директории проекта появится файл `notes.db`. Можно проверить его содержимое:

```bash
sqlite3 notes.db "SELECT * FROM notes;"
```
