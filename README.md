# Lessons API

API для работы с уроками.

## Что умеет

Отдает список уроков с фильтрами. Можно искать по дате, статусу, преподавателям и количеству студентов. Есть пагинация.

## Запуск

```
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run start
```

## Как пользоваться

### Получить все уроки

```
GET /lessons
```

### С фильтрами

```
GET /lessons?date=2019-09-01                    # уроки за день
GET /lessons?date=2019-09-01,2019-09-30         # за период
GET /lessons?status=1                           # только проведенные
GET /lessons?teacherIds=1,2,3                   # конкретные преподаватели
GET /lessons?studentsCount=5                    # ровно 5 студентов
GET /lessons?studentsCount=2,10                 # от 2 до 10 студентов
```

### Пагинация

```
GET /lessons?pageSize=20                        # по 20 на страницу
GET /lessons?lastDate=2019-09-15&lastId=42      # следующая страница
```

## Ответ

```
[
  {
    "id": 1,
    "date": "2019-08-31",
    "title": "Green Color",
    "status": 1,
    "visitCount": 2,
    "students": [
      { "id": 5, "name": "Petr", "visit": true },
      { "id": 6, "name": "Sidr", "visit": true }
    ],
    "teachers": [
      { "id": 1, "name": "Tanya" },
      { "id": 2, "name": "Anna" }
    ]
  }
]
```

## Параметры

-   `date` - дата в формате YYYY-MM-DD или диапазон через запятую
-   `status` - 0 (не проведен) или 1 (проведен)
-   `teacherIds` - ID преподавателей через запятую (максимум 50)
-   `studentsCount` - количество студентов, число или диапазон
-   `pageSize` - размер страницы (максимум 100, по умолчанию 50)
-   `lastDate`, `lastId` - для пагинации, берешь из `nextCursor`

## Ошибки

Если что-то не так, получишь 400 с описанием проблемы:

```
{
    "error": "Validation Error",
    "message": "Invalid date format. Use YYYY-MM-DD"
}
```

## Тесты

Запусти `node test-api.js` - там быстрые проверки основных сценариев.

## Настройки

Все константы в `src/constants/index.js`:

-   размеры страниц
-   лимиты фильтров
-   время кэширования
-   сообщения об ошибках

Меняй там, если нужно.
