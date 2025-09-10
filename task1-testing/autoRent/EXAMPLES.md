# Примеры использования AutoRent API

Этот документ содержит практические примеры использования всех endpoints API системы аренды автомобилей.

## 🔧 Настройка

Убедитесь, что сервер запущен:

```bash
npm start
```

Сервер будет доступен по адресу: `http://localhost:3200`

## 📝 Базовые примеры

### Health Check

Проверка работоспособности сервера:

```bash
curl -X GET http://localhost:3200/health
```

**Ответ:**

```json
{
    "status": "OK",
    "message": "Server is running"
}
```

## 👥 Работа с пользователями

### 1. Создание пользователя

```bash
curl -X POST http://localhost:3200/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Ответ:**

```json
{
    "_id": "507f1f77bcf86cd799439011",
    "username": "john_doe",
    "email": "john@example.com",
    "licens": [],
    "isAdmin": false
}
```

### 2. Получение информации о пользователе

```bash
curl -X GET http://localhost:3200/users/507f1f77bcf86cd799439011 \
  -H "authorization: 507f1f77bcf86cd799439011"
```

### 3. Добавление водительского удостоверения

```bash
curl -X POST http://localhost:3200/users/licens \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "numberLicens": 1234567890,
    "dateRelease": "2020-01-15",
    "dateValidity": "2030-01-15"
  }'
```

### 4. Обновление пользователя

```bash
curl -X PUT http://localhost:3200/users/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "username": "john_updated",
    "email": "john.updated@example.com"
  }'
```

### 5. Удаление пользователя

```bash
curl -X DELETE http://localhost:3200/users/507f1f77bcf86cd799439011 \
  -H "authorization: 507f1f77bcf86cd799439011"
```

## 🚗 Работа с автомобилями

### 1. Создание автомобиля

```bash
curl -X POST http://localhost:3200/vehicle \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "price": 2500.50,
    "photo": "https://example.com/toyota-camry.jpg"
  }'
```

**Ответ:**

```json
{
    "_id": "507f1f77bcf86cd799439012",
    "make": "Toyota",
    "model": "Camry",
    "year": 2022,
    "price": 2500.5,
    "photo": "https://example.com/toyota-camry.jpg"
}
```

### 2. Получение списка автомобилей

```bash
# Все автомобили
curl -X GET http://localhost:3200/vehicle

# С фильтрацией по цене
curl -X GET "http://localhost:3200/vehicle?minPrice=1000&maxPrice=5000"

# С фильтрацией по году
curl -X GET "http://localhost:3200/vehicle?minYear=2020&maxYear=2023"

# С сортировкой по цене (по возрастанию)
curl -X GET "http://localhost:3200/vehicle?sort_by=price&order=asc"

# С сортировкой по году (по убыванию)
curl -X GET "http://localhost:3200/vehicle?sort_by=year&order=desc"

# Комбинированный запрос
curl -X GET "http://localhost:3200/vehicle?minPrice=2000&maxPrice=4000&sort_by=price&order=asc"
```

### 3. Получение конкретного автомобиля

```bash
curl -X GET http://localhost:3200/vehicle/507f1f77bcf86cd799439012
```

### 4. Обновление автомобиля

```bash
curl -X PUT http://localhost:3200/vehicle/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "make": "Toyota",
    "model": "Camry Hybrid",
    "year": 2023,
    "price": 2800.00,
    "photo": "https://example.com/toyota-camry-hybrid.jpg"
  }'
```

### 5. Удаление автомобиля

```bash
curl -X DELETE http://localhost:3200/vehicle/507f1f77bcf86cd799439012 \
  -H "authorization: 507f1f77bcf86cd799439011"
```

## 📅 Работа с бронированиями

### 1. Создание бронирования

```bash
curl -X POST http://localhost:3200/reservations \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "vehicleId": "507f1f77bcf86cd799439012",
    "leaseStart": "2024-01-15",
    "leaseEnd": "2024-01-20",
    "userTgId": 123456789
  }'
```

**Ответ:**

```json
{
    "_id": "507f1f77bcf86cd799439013",
    "vehicleId": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "leaseStart": "2024-01-15",
    "leaseEnd": "2024-01-20",
    "price": 12500.0,
    "status": "Done",
    "userTgId": 123456789
}
```

### 2. Проверка доступности автомобиля

```bash
curl -X GET http://localhost:3200/reservations/507f1f77bcf86cd799439012 \
  -H "authorization: 507f1f77bcf86cd799439011"
```

### 3. История бронирований пользователя

```bash
curl -X GET http://localhost:3200/reservations/ \
  -H "authorization: 507f1f77bcf86cd799439011"
```

### 4. Обновление бронирования

```bash
curl -X PUT http://localhost:3200/reservations/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -H "authorization: 507f1f77bcf86cd799439011" \
  -d '{
    "leaseStart": "2024-01-16",
    "leaseEnd": "2024-01-21",
    "status": "Completed"
  }'
```

### 5. Отмена бронирования

```bash
curl -X PUT http://localhost:3200/reservations/cancel/507f1f77bcf86cd799439013 \
  -H "authorization: 507f1f77bcf86cd799439011"
```

### 6. Статистика завершенных бронирований

```bash
curl -X GET http://localhost:3200/reservations/statistic/completed \
  -H "authorization: 507f1f77bcf86cd799439011"
```

**Ответ:**

```json
{
    "totalCompleted": 15,
    "totalRevenue": 125000.5,
    "averageRentalDuration": 4.2,
    "mostPopularVehicle": {
        "_id": "507f1f77bcf86cd799439012",
        "make": "Toyota",
        "model": "Camry",
        "bookings": 8
    }
}
```

### 7. Статистика пользователей

```bash
curl -X GET http://localhost:3200/reservations/statistic/users \
  -H "authorization: 507f1f77bcf86cd799439011"
```

**Ответ:**

```json
{
    "totalUsers": 25,
    "activeUsers": 18,
    "topUsers": [
        {
            "_id": "507f1f77bcf86cd799439011",
            "username": "john_doe",
            "totalBookings": 5,
            "totalSpent": 15000.0
        }
    ]
}
```

## 🔄 Сценарии использования

### Сценарий 1: Полный цикл аренды

```bash
# 1. Создать пользователя
USER_RESPONSE=$(curl -s -X POST http://localhost:3200/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice_smith",
    "email": "alice@example.com",
    "password": "securepass123"
  }')

USER_ID=$(echo $USER_RESPONSE | jq -r '._id')

# 2. Добавить водительское удостоверение
curl -X POST http://localhost:3200/users/licens \
  -H "Content-Type: application/json" \
  -H "authorization: $USER_ID" \
  -d '{
    "numberLicens": 9876543210,
    "dateRelease": "2019-05-10",
    "dateValidity": "2029-05-10"
  }'

# 3. Создать автомобиль
VEHICLE_RESPONSE=$(curl -s -X POST http://localhost:3200/vehicle \
  -H "Content-Type: application/json" \
  -H "authorization: $USER_ID" \
  -d '{
    "make": "BMW",
    "model": "X5",
    "year": 2023,
    "price": 4500.00,
    "photo": "https://example.com/bmw-x5.jpg"
  }')

VEHICLE_ID=$(echo $VEHICLE_RESPONSE | jq -r '._id')

# 4. Проверить доступность автомобиля
curl -X GET http://localhost:3200/reservations/$VEHICLE_ID \
  -H "authorization: $USER_ID"

# 5. Создать бронирование
RESERVATION_RESPONSE=$(curl -s -X POST http://localhost:3200/reservations \
  -H "Content-Type: application/json" \
  -H "authorization: $USER_ID" \
  -d '{
    "vehicleId": "'$VEHICLE_ID'",
    "leaseStart": "2024-02-01",
    "leaseEnd": "2024-02-05"
  }')

RESERVATION_ID=$(echo $RESERVATION_RESPONSE | jq -r '._id')

# 6. Просмотреть историю бронирований
curl -X GET http://localhost:3200/reservations/ \
  -H "authorization: $USER_ID"

# 7. Завершить бронирование
curl -X PUT http://localhost:3200/reservations/$RESERVATION_ID \
  -H "Content-Type: application/json" \
  -H "authorization: $USER_ID" \
  -d '{
    "status": "Completed"
  }'
```

### Сценарий 2: Поиск и фильтрация автомобилей

```bash
# Поиск доступных автомобилей в ценовом диапазоне
curl -X GET "http://localhost:3200/vehicle?minPrice=2000&maxPrice=3500&sort_by=price&order=asc"

# Поиск новых автомобилей
curl -X GET "http://localhost:3200/vehicle?minYear=2022&sort_by=year&order=desc"

# Поиск премиум автомобилей
curl -X GET "http://localhost:3200/vehicle?minPrice=4000&sort_by=price&order=desc"
```

### Сценарий 3: Административные операции

```bash
# Получить статистику системы
curl -X GET http://localhost:3200/reservations/statistic/completed \
  -H "authorization: 68c0687cf1ef183532fe744f"  # Admin ID

curl -X GET http://localhost:3200/reservations/statistic/users \
  -H "authorization: 68c0687cf1ef183532fe744f"

# Просмотреть все автомобили
curl -X GET http://localhost:3200/vehicle

# Управление автомобилями
curl -X PUT http://localhost:3200/vehicle/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -H "authorization: 68c0687cf1ef183532fe744f" \
  -d '{
    "price": 2200.00
  }'
```

## 🧪 Тестирование с помощью JavaScript

### Пример использования fetch API

```javascript
// Создание пользователя
async function createUser() {
    const response = await fetch("http://localhost:3200/users", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: "test_user",
            email: "test@example.com",
            password: "testpass123",
        }),
    });

    const user = await response.json();
    console.log("Created user:", user);
    return user._id;
}

// Получение списка автомобилей
async function getVehicles(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`http://localhost:3200/vehicle?${params}`);
    const vehicles = await response.json();
    console.log("Vehicles:", vehicles);
    return vehicles;
}

// Создание бронирования
async function createReservation(userId, vehicleId) {
    const response = await fetch("http://localhost:3200/reservations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            authorization: userId,
        },
        body: JSON.stringify({
            vehicleId: vehicleId,
            leaseStart: "2024-03-01",
            leaseEnd: "2024-03-05",
        }),
    });

    const reservation = await response.json();
    console.log("Created reservation:", reservation);
    return reservation;
}

// Использование
async function example() {
    try {
        const userId = await createUser();
        const vehicles = await getVehicles({ minPrice: 2000, maxPrice: 4000 });

        if (vehicles.length > 0) {
            const reservation = await createReservation(
                userId,
                vehicles[0]._id
            );
            console.log("Booking completed successfully!");
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
```

## 🐍 Пример на Python

```python
import requests
import json

BASE_URL = 'http://localhost:3200'

def create_user(username, email, password):
    """Создание нового пользователя"""
    response = requests.post(f'{BASE_URL}/users', json={
        'username': username,
        'email': email,
        'password': password
    })
    return response.json()

def get_vehicles(filters=None):
    """Получение списка автомобилей с фильтрами"""
    params = filters or {}
    response = requests.get(f'{BASE_URL}/vehicle', params=params)
    return response.json()

def create_reservation(user_id, vehicle_id, start_date, end_date):
    """Создание бронирования"""
    headers = {'authorization': user_id}
    response = requests.post(f'{BASE_URL}/reservations',
                           headers=headers,
                           json={
                               'vehicleId': vehicle_id,
                               'leaseStart': start_date,
                               'leaseEnd': end_date
                           })
    return response.json()

# Пример использования
if __name__ == '__main__':
    # Создать пользователя
    user = create_user('python_user', 'python@example.com', 'pythonpass123')
    user_id = user['_id']

    # Найти доступные автомобили
    vehicles = get_vehicles({'minPrice': 2000, 'maxPrice': 3000})

    if vehicles:
        # Забронировать первый автомобиль
        reservation = create_reservation(
            user_id,
            vehicles[0]['_id'],
            '2024-04-01',
            '2024-04-05'
        )
        print(f"Reservation created: {reservation['_id']}")
```

## 🔍 Отладка и мониторинг

### Проверка состояния сервера

```bash
# Health check
curl -w "\n%{http_code}\n" http://localhost:3200/health

# Проверка времени ответа
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3200/health
```

Создайте файл `curl-format.txt`:

```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### Логирование запросов

```bash
# Включить подробное логирование
DEBUG=* npm start

# Логирование только HTTP запросов
DEBUG=express:* npm start
```

## ❌ Обработка ошибок

### Типичные ошибки и их коды

```bash
# 400 - Ошибка валидации
curl -X POST http://localhost:3200/users \
  -H "Content-Type: application/json" \
  -d '{"username": "", "email": "invalid-email"}'

# 401 - Не авторизован
curl -X GET http://localhost:3200/users/507f1f77bcf86cd799439011

# 404 - Ресурс не найден
curl -X GET http://localhost:3200/users/invalid-id \
  -H "authorization: 507f1f77bcf86cd799439011"

# 500 - Внутренняя ошибка сервера (например, при недоступности БД)
```

### Примеры ответов с ошибками

**400 Bad Request:**

```json
{
    "errors": [
        {
            "msg": "Username is required",
            "param": "username",
            "location": "body"
        },
        {
            "msg": "Invalid email format",
            "param": "email",
            "location": "body"
        }
    ]
}
```

**401 Unauthorized:**

```json
{
    "error": "Authorization header is required"
}
```

**404 Not Found:**

```json
{
    "error": "User not found"
}
```

## 📊 Performance тестирование

### Простой нагрузочный тест

```bash
# Установить Apache Bench (если не установлен)
# macOS: brew install httpie
# Ubuntu: sudo apt-get install apache2-utils

# Тест GET запросов
ab -n 1000 -c 10 http://localhost:3200/health

# Тест POST запросов с данными
ab -n 100 -c 5 -p user-data.json -T application/json http://localhost:3200/users
```

Создайте файл `user-data.json`:

```json
{
    "username": "load_test_user",
    "email": "loadtest@example.com",
    "password": "loadtest123"
}
```

### Использование встроенных performance тестов

```bash
# Запуск всех performance тестов
npm run test:performance:full

# Отдельные тесты
npm run test:performance:vehicle
npm run test:performance:users
npm run test:performance:reservations
```

---

Этот документ содержит исчерпывающие примеры использования AutoRent API. Для получения дополнительной информации обращайтесь к [Swagger документации](http://localhost:3200/api-docs) или основному [README](README.md).
