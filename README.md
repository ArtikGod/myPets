# Wildberries Tariffs Collector

Приложение для автоматического сбора тарифов Wildberries и синхронизации с Google Sheets. Приложение работает по расписанию, получает актуальные тарифы складов Wildberries, сохраняет их в PostgreSQL базу данных и обновляет Google таблицы.

## Возможности

-   🔄 Автоматический сбор тарифов Wildberries API каждый час
-   📊 Сохранение данных в PostgreSQL базу данных
-   📈 Синхронизация с Google Sheets
-   🐳 Полная контейнеризация с Docker Compose
-   📝 Подробное логирование всех операций
-   🔒 Безопасное хранение конфигурации

## Требования

-   Docker и Docker Compose
-   Токен Wildberries API
-   Настроенный Google Sheets API (service account)

## Быстрый старт

### 1. Клонирование и настройка

```bash
# Перейти в директорию проекта
cd wb

# Создать файл конфигурации из шаблона
cp .env.docker.template .env.docker
```

### 2. Настройка переменных окружения

Отредактируйте файл `.env.docker`:

```bash
# Wildberries API
WB_API_TOKEN=your_wildberries_api_token_here

# Google Sheets (ID таблиц через запятую)
GOOGLE_SHEETS_IDS=your_google_sheets_id_here

# Database (можно оставить по умолчанию)
DB_HOST=postgres
DB_PORT=5432
DB_NAME=wb_tariffs
DB_USER=postgres
DB_PASSWORD=password

# Application
NODE_ENV=production
```

### 3. Настройка Google Sheets API

1. Создайте проект в [Google Cloud Console](https://console.cloud.google.com/)
2. Включите Google Sheets API
3. Создайте Service Account
4. Скачайте JSON ключ и сохраните как `google.json` в корне проекта
5. Предоставьте доступ к вашим Google таблицам для email из service account

### 4. Запуск приложения

```bash
# Запуск всех сервисов
docker compose up --build

# Запуск в фоновом режиме
docker compose up -d --build
```

Приложение автоматически:

-   Создаст базу данных PostgreSQL
-   Выполнит миграции
-   Начнет сбор тарифов каждый час
-   Будет синхронизировать данные с Google Sheets

## API и данные

### Wildberries API

Приложение использует Wildberries API для получения тарифов:

-   Endpoint: `https://common-api.wildberries.ru/api/v1/tariffs/box`
-   Требует авторизационный токен
-   Возвращает тарифы для всех складов

### Структура данных тарифов

```typescript
interface Tariff {
    id: number;
    warehouse_name: string;
    box_delivery_and_storage_expr: string;
    box_delivery_base: number;
    box_delivery_liter: number;
    box_storage_base: number;
    box_storage_liter: number;
    created_at: Date;
    updated_at: Date;
}
```

### Google Sheets

Данные синхронизируются в Google таблицы в следующем формате:

-   Лист: `stocks_coefs`
-   Столбцы: Название склада, Доставка база, Доставка литр, Хранение база, Хранение литр
-   Данные сортируются по возрастанию коэффициента "Доставка база"

## Безопасность

-   ✅ Чувствительные данные хранятся в `.env.docker` (исключен из git)
-   ✅ Используется `.env.docker.template` для примера конфигурации
-   ✅ Google Service Account ключи исключены из git
-   ✅ База данных доступна только внутри Docker сети
-   ✅ Приложение работает от непривилегированного пользователя
