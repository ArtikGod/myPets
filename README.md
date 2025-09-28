Backend API (Node.js/Express)
✅ POST /orders - создание заказа с валидацией
✅ GET /orders/:id - получение заказа по ID

✅ GET /analytics/weekly - аналитика за последние 7 дней

Бизнес-правила
✅ Валидация пустых заказов (возврат ошибки 400)
✅ Проверка qty > 0 (отклонение заказов с неверным количеством)
✅ Автоматическое определение крупных заказов (≥ 10,000 ₽)

Архитектура
✅ Логика расчета суммы вынесена в отдельный сервис OrderService
✅ Валидация в middleware validation.js
✅ Константы в отдельном модуле constants/index.js
✅ Примитивный логгер запросов logger.js

Frontend (Vue.js)
✅ Главная страница с статистикой Home.vue
✅ Создание заказов CreateOrder.vue
✅ Список заказов OrdersList.vue
✅ Детали заказа OrderDetails.vue
✅ Аналитика Analytics.vue

🚀 Запуск приложения

## Обычный запуск

Backend (порт 3001):

```bash
npm install
npm start
```

Frontend (порт 8080):

```bash
cd frontend
npm install
npm run dev
```

## Docker запуск

Запуск всего приложения с помощью Docker Compose:

```bash
docker-compose up --build
```

После запуска:

-   Backend API будет доступен на http://localhost:3001
-   Frontend будет доступен на http://localhost:8080

Остановка:

```bash
docker-compose down
```

Запуск в фоновом режиме:

```bash
docker-compose up -d --build
```

Просмотр логов:

```bash
docker-compose logs -f
```
