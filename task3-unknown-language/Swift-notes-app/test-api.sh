#!/bin/bash

# Скрипт для тестирования Notes API
# Убедитесь, что сервер запущен на localhost:8080

BASE_URL="http://localhost:8080"
CONTENT_TYPE="Content-Type: application/json"

echo "🚀 Тестирование Notes API"
echo "=========================="

# Функция для красивого вывода
print_test() {
    echo ""
    echo "📝 $1"
    echo "---"
}

print_response() {
    echo "Ответ: $1"
    echo ""
}

# Проверка работоспособности сервера
print_test "1. Проверка работоспособности сервера"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Сервер работает"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Сервер не отвечает (код: $http_code)"
    exit 1
fi

# Получение всех заметок (должно быть пусто)
print_test "2. Получение всех заметок (пустой список)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/notes")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Получен список заметок"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Ошибка получения заметок (код: $http_code)"
    echo "$body"
fi

# Создание первой заметки
print_test "3. Создание первой заметки"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/notes" \
    -H "$CONTENT_TYPE" \
    -d '{"text": "Моя первая заметка через API"}')
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "201" ]; then
    echo "✅ Заметка создана"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    # Извлекаем ID для дальнейших тестов
    note_id=$(echo "$body" | jq -r '.id' 2>/dev/null || echo "1")
else
    echo "❌ Ошибка создания заметки (код: $http_code)"
    echo "$body"
    note_id="1"
fi

# Создание второй заметки
print_test "4. Создание второй заметки"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/notes" \
    -H "$CONTENT_TYPE" \
    -d '{"text": "Вторая заметка для тестирования"}')
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "201" ]; then
    echo "✅ Вторая заметка создана"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Ошибка создания второй заметки (код: $http_code)"
    echo "$body"
fi

# Получение всех заметок
print_test "5. Получение всех заметок"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/notes")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Получен список заметок"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Ошибка получения заметок (код: $http_code)"
    echo "$body"
fi

# Получение заметки по ID
print_test "6. Получение заметки по ID ($note_id)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/notes/$note_id")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Заметка получена"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Ошибка получения заметки (код: $http_code)"
    echo "$body"
fi

# Обновление заметки
print_test "7. Обновление заметки"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X PUT "$BASE_URL/notes/$note_id" \
    -H "$CONTENT_TYPE" \
    -d '{"text": "Обновленная заметка через API"}')
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "200" ]; then
    echo "✅ Заметка обновлена"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Ошибка обновления заметки (код: $http_code)"
    echo "$body"
fi

# Тестирование валидации - пустой текст
print_test "8. Тестирование валидации (пустой текст)"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/notes" \
    -H "$CONTENT_TYPE" \
    -d '{"text": ""}')
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "400" ]; then
    echo "✅ Валидация работает (пустой текст отклонен)"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Валидация не работает (код: $http_code)"
    echo "$body"
fi

# Тестирование валидации - слишком длинный текст
print_test "9. Тестирование валидации (слишком длинный текст)"
long_text=$(printf 'a%.0s' {1..501})  # 501 символ
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/notes" \
    -H "$CONTENT_TYPE" \
    -d "{\"text\": \"$long_text\"}")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "400" ]; then
    echo "✅ Валидация работает (длинный текст отклонен)"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Валидация не работает (код: $http_code)"
    echo "$body"
fi

# Тестирование несуществующего ID
print_test "10. Получение несуществующей заметки"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/notes/999")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "404" ]; then
    echo "✅ Корректная обработка несуществующего ID"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Неправильная обработка несуществующего ID (код: $http_code)"
    echo "$body"
fi

# Удаление заметки
print_test "11. Удаление заметки"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X DELETE "$BASE_URL/notes/$note_id")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$http_code" = "204" ]; then
    echo "✅ Заметка удалена"
else
    echo "❌ Ошибка удаления заметки (код: $http_code)"
fi

# Проверка удаления
print_test "12. Проверка удаления заметки"
response=$(curl -s -w "\nHTTP_CODE:%{http_code}" "$BASE_URL/notes/$note_id")
http_code=$(echo "$response" | grep "HTTP_CODE" | cut -d: -f2)
body=$(echo "$response" | sed '/HTTP_CODE/d')

if [ "$http_code" = "404" ]; then
    echo "✅ Заметка успешно удалена"
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
else
    echo "❌ Заметка не была удалена (код: $http_code)"
    echo "$body"
fi

echo ""
echo "🎉 Тестирование завершено!"
echo "=========================="