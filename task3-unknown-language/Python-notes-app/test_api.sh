#!/bin/bash

# Скрипт для тестирования Notes API
# Убедитесь, что сервер запущен на localhost:8000

echo "=== Тестирование Notes API ==="
echo

BASE_URL="http://localhost:8000/api"

echo "1. Получение всех заметок (должно быть пусто):"
curl -s -X GET "$BASE_URL/notes" | python -m json.tool
echo -e "\n"

echo "2. Создание первой заметки:"
RESPONSE1=$(curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{"text": "Моя первая заметка"}')
echo "$RESPONSE1" | python -m json.tool
NOTE_ID1=$(echo "$RESPONSE1" | python -c "import sys, json; print(json.load(sys.stdin)['note']['id'])")
echo -e "\n"

echo "3. Создание второй заметки:"
RESPONSE2=$(curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{"text": "Вторая заметка для тестирования"}')
echo "$RESPONSE2" | python -m json.tool
NOTE_ID2=$(echo "$RESPONSE2" | python -c "import sys, json; print(json.load(sys.stdin)['note']['id'])")
echo -e "\n"

echo "4. Получение всех заметок (должно быть 2):"
curl -s -X GET "$BASE_URL/notes" | python -m json.tool
echo -e "\n"

echo "5. Получение заметки по ID ($NOTE_ID1):"
curl -s -X GET "$BASE_URL/notes/$NOTE_ID1" | python -m json.tool
echo -e "\n"

echo "6. Обновление заметки ($NOTE_ID1):"
curl -s -X PUT "$BASE_URL/notes/$NOTE_ID1" \
  -H "Content-Type: application/json" \
  -d '{"text": "Обновленная первая заметка"}' | python -m json.tool
echo -e "\n"

echo "7. Получение количества заметок:"
curl -s -X GET "$BASE_URL/notes/count" | python -m json.tool
echo -e "\n"

echo "8. Тест валидации - пустая заметка (должна вернуть ошибку):"
curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d '{"text": ""}' | python -m json.tool
echo -e "\n"

echo "9. Тест валидации - слишком длинная заметка (должна вернуть ошибку):"
LONG_TEXT=$(python -c "print('a' * 501)")
curl -s -X POST "$BASE_URL/notes" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"$LONG_TEXT\"}" | python -m json.tool
echo -e "\n"

echo "10. Тест получения несуществующей заметки (должна вернуть 404):"
curl -s -X GET "$BASE_URL/notes/999" | python -m json.tool
echo -e "\n"

echo "11. Удаление заметки ($NOTE_ID2):"
curl -s -X DELETE "$BASE_URL/notes/$NOTE_ID2" | python -m json.tool
echo -e "\n"

echo "12. Проверка удаления - получение всех заметок (должна остаться 1):"
curl -s -X GET "$BASE_URL/notes" | python -m json.tool
echo -e "\n"

echo "13. Удаление оставшейся заметки ($NOTE_ID1):"
curl -s -X DELETE "$BASE_URL/notes/$NOTE_ID1" | python -m json.tool
echo -e "\n"

echo "14. Финальная проверка - получение всех заметок (должно быть пусто):"
curl -s -X GET "$BASE_URL/notes" | python -m json.tool
echo -e "\n"

echo "=== Тестирование завершено ==="