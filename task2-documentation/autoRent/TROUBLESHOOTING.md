# Troubleshooting Guide - AutoRent API

Полное руководство по диагностике и решению проблем в системе аренды автомобилей AutoRent.

## 🚨 Быстрая диагностика

### Проверочный список

1. **Сервер запущен?**

    ```bash
    curl http://localhost:3200/health
    ```

2. **MongoDB доступен?**

    ```bash
    mongosh --eval "db.runCommand('ping')"
    ```

3. **Порт свободен?**

    ```bash
    lsof -i :3200
    ```

4. **Переменные окружения настроены?**
    ```bash
    cat .env
    ```

## 🔧 Проблемы запуска

### Проблема: Сервер не запускается

**Симптомы:**

-   Ошибка при выполнении `npm start`
-   Сообщение "Port already in use"
-   Приложение завершается сразу после запуска

**Диагностика:**

```bash
# Проверить, что порт свободен
lsof -i :3200

# Проверить процессы Node.js
ps aux | grep node

# Проверить логи
npm start 2>&1 | tee server.log
```

**Решения:**

1. **Порт занят:**

    ```bash
    # Найти процесс, использующий порт
    lsof -i :3200

    # Завершить процесс
    kill -9 <PID>

    # Или изменить порт в .env
    echo "PORT=3201" >> .env
    ```

2. **Отсутствуют зависимости:**

    ```bash
    # Переустановить зависимости
    rm -rf node_modules package-lock.json
    npm install
    ```

3. **Ошибки TypeScript:**

    ```bash
    # Проверить синтаксис
    npx tsc --noEmit

    # Очистить кэш TypeScript
    rm -rf dist/
    ```

### Проблема: Ошибки подключения к MongoDB

**Симптомы:**

-   "MongoNetworkError: failed to connect to server"
-   "Authentication failed"
-   Сервер запускается, но API возвращает 500 ошибки

**Диагностика:**

```bash
# Проверить статус MongoDB
brew services list | grep mongodb  # macOS
systemctl status mongod            # Linux
net start | findstr MongoDB        # Windows

# Тест подключения
mongosh mongodb://localhost:27017/auto

# Проверить логи MongoDB
tail -f /usr/local/var/log/mongodb/mongo.log  # macOS
tail -f /var/log/mongodb/mongod.log           # Linux
```

**Решения:**

1. **MongoDB не запущен:**

    ```bash
    # macOS
    brew services start mongodb-community

    # Linux
    sudo systemctl start mongod

    # Windows
    net start MongoDB
    ```

2. **Неверная строка подключения:**

    ```bash
    # Проверить .env файл
    cat .env | grep DB_CONNECTION_STRING

    # Исправить строку подключения
    echo "DB_CONNECTION_STRING=mongodb://localhost:27017/auto" > .env
    ```

3. **Проблемы с правами доступа:**
    ```bash
    # Создать пользователя MongoDB (если нужно)
    mongosh --eval "
    use admin
    db.createUser({
      user: 'autorent',
      pwd: 'password',
      roles: ['readWrite']
    })"
    ```

## 🌐 Проблемы API

### Проблема: 401 Unauthorized ошибки

**Симптомы:**

-   Все запросы возвращают 401
-   "Authorization header is required"
-   "Invalid user ID"

**Диагностика:**

```bash
# Проверить заголовок авторизации
curl -v -H "authorization: 507f1f77bcf86cd799439011" \
     http://localhost:3200/users/507f1f77bcf86cd799439011

# Проверить формат ID
echo "507f1f77bcf86cd799439011" | wc -c  # Должно быть 25 (24 + \n)
```

**Решения:**

1. **Отсутствует заголовок:**

    ```bash
    # Правильный запрос
    curl -H "authorization: 507f1f77bcf86cd799439011" \
         http://localhost:3200/users/507f1f77bcf86cd799439011
    ```

2. **Неверный формат ID:**

    ```bash
    # ID должен быть 24 символа (MongoDB ObjectId)
    # Правильный: 507f1f77bcf86cd799439011
    # Неправильный: 123 или invalid-id
    ```

3. **Пользователь не существует:**
    ```bash
    # Создать тестового пользователя
    curl -X POST http://localhost:3200/users \
      -H "Content-Type: application/json" \
      -d '{"username": "test", "email": "test@example.com", "password": "test123"}'
    ```

### Проблема: 400 Validation ошибки

**Симптомы:**

-   "Validation failed"
-   Ошибки валидации полей
-   Неожиданные требования к данным

**Диагностика:**

```bash
# Проверить структуру ошибки
curl -X POST http://localhost:3200/users \
  -H "Content-Type: application/json" \
  -d '{"username": "", "email": "invalid"}' \
  | jq .
```

**Решения:**

1. **Проверить требования к полям:**

    - `username`: максимум 50 символов, обязательное
    - `email`: валидный email формат
    - `numberLicens`: точно 10 цифр
    - `year`: от 1900 до текущего года + 1
    - `price`: положительное число

2. **Примеры правильных данных:**

    ```bash
    # Пользователь
    curl -X POST http://localhost:3200/users \
      -H "Content-Type: application/json" \
      -d '{
        "username": "valid_user",
        "email": "valid@example.com",
        "password": "password123"
      }'

    # Автомобиль
    curl -X POST http://localhost:3200/vehicle \
      -H "Content-Type: application/json" \
      -H "authorization: 507f1f77bcf86cd799439011" \
      -d '{
        "make": "Toyota",
        "model": "Camry",
        "year": 2023,
        "price": 2500.50,
        "photo": "https://example.com/car.jpg"
      }'
    ```

### Проблема: 500 Internal Server Error

**Симптомы:**

-   Неожиданные ошибки сервера
-   API недоступен
-   Ошибки в логах сервера

**Диагностика:**

```bash
# Проверить логи сервера
npm start 2>&1 | tee server.log

# Проверить подключение к БД
mongosh --eval "db.runCommand('ping')"

# Проверить использование памяти
ps aux | grep node
```

**Решения:**

1. **Перезапустить сервер:**

    ```bash
    # Остановить все процессы Node.js
    pkill -f node

    # Запустить заново
    npm start
    ```

2. **Проверить базу данных:**

    ```bash
    # Переподключиться к MongoDB
    mongosh mongodb://localhost:27017/auto --eval "db.stats()"
    ```

3. **Очистить кэш:**
    ```bash
    rm -rf node_modules/.cache
    npm start
    ```

## 📊 Проблемы с тестами

### Проблема: Тесты не проходят

**Симптомы:**

-   Jest тесты падают
-   Timeout ошибки
-   Проблемы с подключением к тестовой БД

**Диагностика:**

```bash
# Запустить тесты с подробным выводом
npm test -- --verbose

# Проверить конфигурацию Jest
cat jest.config.ts

# Проверить тестовую БД
mongosh mongodb://localhost:27017/auto_test
```

**Решения:**

1. **Проблемы с тестовой БД:**

    ```bash
    # Создать тестовую БД
    mongosh --eval "use auto_test"

    # Очистить тестовые данные
    mongosh auto_test --eval "db.dropDatabase()"
    ```

2. **Timeout проблемы:**

    ```bash
    # Увеличить timeout в jest.config.ts
    # testTimeout: 30000

    # Запустить тесты последовательно
    npm test -- --runInBand
    ```

3. **Проблемы с мокированием:**

    ```bash
    # Очистить кэш Jest
    npm test -- --clearCache

    # Запустить конкретный тест
    npm test -- --testNamePattern="specific test"
    ```

### Проблема: Performance тесты показывают плохие результаты

**Симптомы:**

-   Низкий RPS (< 50)
-   Высокая задержка (> 2000ms)
-   Много ошибок timeout

**Диагностика:**

```bash
# Запустить отдельный performance тест
npm run test:performance:vehicle

# Проверить нагрузку на систему
top
htop  # если установлен

# Проверить подключения к БД
mongosh --eval "db.serverStatus().connections"
```

**Решения:**

1. **Оптимизация MongoDB:**

    ```bash
    # Добавить индексы
    mongosh auto --eval "
    db.users.createIndex({email: 1})
    db.vehicles.createIndex({make: 1, model: 1})
    db.reservations.createIndex({userId: 1, vehicleId: 1})
    "
    ```

2. **Увеличить connection pool:**

    ```typescript
    // В connectdb.ts
    mongoose.connect(connectionString, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });
    ```

3. **Оптимизация запросов:**
    ```bash
    # Анализ медленных запросов
    mongosh auto --eval "db.setProfilingLevel(2, {slowms: 100})"
    mongosh auto --eval "db.system.profile.find().sort({ts: -1}).limit(5)"
    ```

## 🔒 Проблемы безопасности

### Проблема: CORS ошибки

**Симптомы:**

-   "Access to fetch blocked by CORS policy"
-   Ошибки при запросах из браузера
-   Preflight запросы не проходят

**Решения:**

1. **Настроить CORS в app.ts:**

    ```typescript
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header(
            "Access-Control-Allow-Methods",
            "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );

        if (req.method === "OPTIONS") {
            res.sendStatus(200);
        } else {
            next();
        }
    });
    ```

2. **Использовать cors middleware:**

    ```bash
    npm install cors @types/cors
    ```

    ```typescript
    import cors from "cors";
    app.use(
        cors({
            origin: ["http://localhost:3000", "http://localhost:3200"],
            credentials: true,
        })
    );
    ```

## 📱 Проблемы с Telegram ботом

### Проблема: Бот не отвечает

**Симптомы:**

-   Бот не реагирует на команды
-   Ошибки в логах о Telegram API
-   Webhook не работает

**Диагностика:**

```bash
# Проверить токен бота
curl "https://api.telegram.org/bot$TG_BOT_TOKEN/getMe"

# Проверить webhook
curl "https://api.telegram.org/bot$TG_BOT_TOKEN/getWebhookInfo"
```

**Решения:**

1. **Проверить токен:**

    ```bash
    # В .env файле
    echo "TG_BOT_TOKEN=your_actual_bot_token" >> .env
    ```

2. **Перезапустить бота:**

    ```bash
    # Остановить сервер
    pkill -f node

    # Запустить без Telegram бота для тестирования
    NODE_ENV=test npm start
    ```

## 🔍 Инструменты диагностики

### Логирование

```bash
# Включить подробное логирование
DEBUG=* npm start

# Логирование только Express
DEBUG=express:* npm start

# Логирование MongoDB
DEBUG=mongoose:* npm start
```

### Мониторинг производительности

```bash
# Установить clinic.js для анализа производительности
npm install -g clinic

# Анализ производительности
clinic doctor -- npm start

# Анализ памяти
clinic heapprofiler -- npm start
```

### Анализ базы данных

```bash
# Статистика БД
mongosh auto --eval "db.stats()"

# Размер коллекций
mongosh auto --eval "
db.users.stats()
db.vehicles.stats()
db.reservations.stats()
"

# Медленные запросы
mongosh auto --eval "db.system.profile.find().sort({ts: -1}).limit(10)"
```

## 🚀 Оптимизация производительности

### Рекомендации по БД

1. **Добавить индексы:**

    ```javascript
    // В MongoDB
    db.users.createIndex({ email: 1 }, { unique: true });
    db.vehicles.createIndex({ make: 1, model: 1 });
    db.vehicles.createIndex({ price: 1 });
    db.vehicles.createIndex({ year: 1 });
    db.reservations.createIndex({ userId: 1 });
    db.reservations.createIndex({ vehicleId: 1 });
    db.reservations.createIndex({ leaseStart: 1, leaseEnd: 1 });
    ```

2. **Оптимизировать запросы:**

    ```typescript
    // Использовать проекцию
    const users = await User.find({}, "username email");

    // Использовать лимиты
    const vehicles = await Vehicle.find().limit(20);

    // Использовать агрегацию для статистики
    const stats = await Reservation.aggregate([
        { $match: { status: "Completed" } },
        { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    ```

### Кэширование

```typescript
// Простое кэширование в памяти
const cache = new Map();

app.get("/vehicles", (req, res) => {
    const cacheKey = JSON.stringify(req.query);

    if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
    }

    // Получить данные из БД
    // Сохранить в кэш
    cache.set(cacheKey, data);
    res.json(data);
});
```

## 📞 Получение помощи

### Сбор информации для поддержки

```bash
# Создать отчет о системе
cat > system-report.txt << EOF
=== System Information ===
OS: $(uname -a)
Node.js: $(node --version)
npm: $(npm --version)
MongoDB: $(mongosh --version)

=== Application Status ===
Server Status: $(curl -s http://localhost:3200/health || echo "Not running")
DB Status: $(mongosh --quiet --eval "db.runCommand('ping')" 2>/dev/null || echo "Not connected")

=== Recent Logs ===
$(tail -20 server.log 2>/dev/null || echo "No logs found")

=== Package Versions ===
$(npm list --depth=0)
EOF
```

### Контакты поддержки

-   **Email**: support@autorent.com
-   **GitHub Issues**: для сообщения о багах
-   **Документация**: http://localhost:3200/api-docs

### Полезные ссылки

-   [MongoDB Troubleshooting](https://docs.mongodb.com/manual/faq/diagnostics/)
-   [Express.js Debugging](https://expressjs.com/en/guide/debugging.html)
-   [Node.js Performance](https://nodejs.org/en/docs/guides/simple-profiling/)
-   [Jest Troubleshooting](https://jestjs.io/docs/troubleshooting)

---

**Примечание**: Если проблема не решается с помощью этого руководства, создайте issue с подробным описанием проблемы и приложите system-report.txt.
