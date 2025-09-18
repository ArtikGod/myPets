# Wildberries Tariffs Collector

Приложение для автоматического сбора тарифов Wildberries и синхронизации с Google Sheets. Приложение работает по расписанию, получает актуальные тарифы складов Wildberries, сохраняет их в PostgreSQL базу данных и обновляет Google таблицы.

## Возможности

-   🔄 Автоматический сбор тарифов Wildberries API каждый час
-   📊 Сохранение данных в PostgreSQL базу данных
-   📈 Синхронизация с Google Sheets
-   🐳 Полная контейнеризация с Docker Compose
-   📝 Подробное логирование всех операций
-   🔒 Безопасное хранение конфигурации

## Архитектура

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Wildberries   │───▶│   Application    │───▶│   PostgreSQL    │
│      API        │    │   (Node.js +     │    │    Database     │
└─────────────────┘    │   TypeScript)    │    └─────────────────┘
                       └──────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Google Sheets  │
                       │      API        │
                       └─────────────────┘
```

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

## Управление приложением

### Остановка приложения

```bash
# Остановка всех сервисов
docker compose down

# Остановка с удалением volumes (ВНИМАНИЕ: удалит все данные)
docker compose down -v
```

### Перезапуск

```bash
# Перезапуск всех сервисов
docker compose restart

# Перезапуск только приложения
docker compose restart app
```

## Структура проекта

```
test/wb/
├── src/                          # Исходный код
│   ├── index.ts                  # Точка входа
│   ├── config/
│   │   └── knex.ts              # Конфигурация базы данных
│   ├── constants/
│   │   └── constants.ts         # Константы приложения
│   ├── cron/
│   │   └── scheduler.ts         # Планировщик задач
│   ├── migrations/
│   │   └── 001_create_tariffs_table.ts  # Миграции БД
│   ├── services/
│   │   ├── database.ts          # Сервис работы с БД
│   │   ├── googleSheets.ts      # Сервис Google Sheets
│   │   └── wildberries.ts       # Сервис Wildberries API
│   └── types/
│       └── tariff.ts            # Типы данных
├── docker-compose.yml           # Docker Compose конфигурация
├── Dockerfile                   # Docker образ приложения
├── package.json                 # Зависимости Node.js
├── tsconfig.json               # Конфигурация TypeScript
├── knexfile.ts                 # Конфигурация Knex.js
├── .env.docker.template        # Шаблон переменных окружения
├── .gitignore                  # Игнорируемые файлы
└── README.md                   # Документация
```

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

## Мониторинг и отладка

### Проверка состояния сервисов

```bash
# Статус всех контейнеров
docker compose ps

# Использование ресурсов
docker compose top
```

### Подключение к базе данных

```bash
# Подключение к PostgreSQL
docker compose exec postgres psql -U postgres -d wb_tariffs

# Просмотр таблиц
\dt

# Просмотр данных
SELECT * FROM tariffs LIMIT 10;
```

### Отладка приложения

```bash
# Выполнение команд внутри контейнера
docker compose exec app sh

# Просмотр переменных окружения
docker compose exec app env
```

## Безопасность

-   ✅ Чувствительные данные хранятся в `.env.docker` (исключен из git)
-   ✅ Используется `.env.docker.template` для примера конфигурации
-   ✅ Google Service Account ключи исключены из git
-   ✅ База данных доступна только внутри Docker сети
-   ✅ Приложение работает от непривилегированного пользователя

## Устранение неполадок

### Приложение не запускается

1. Проверьте правильность `.env.docker`:

    ```bash
    cat .env.docker
    ```

2. Проверьте логи:

    ```bash
    docker compose logs app
    ```

3. Убедитесь, что порты свободны:
    ```bash
    netstat -tulpn | grep 5433
    ```

### Ошибки подключения к Wildberries API

1. Проверьте токен API
2. Убедитесь в доступности интернета из контейнера
3. Проверьте rate limits в логах

### Ошибки Google Sheets

1. Убедитесь, что файл `google.json` существует
2. Проверьте права доступа к таблицам
3. Убедитесь, что Google Sheets API включен

### Проблемы с базой данных

1. Проверьте состояние PostgreSQL:

    ```bash
    docker compose exec postgres pg_isready -U postgres
    ```

2. Пересоздайте базу данных:
    ```bash
    docker compose down -v
    docker compose up --build
    ```

## Разработка

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка проекта
npm run build

# Создание миграции
npm run migrate:make migration_name
```

## Лицензия

MIT License

## Поддержка

При возникновении проблем:

1. Проверьте логи приложения
2. Убедитесь в правильности конфигурации
3. Проверьте доступность внешних API
4. Создайте issue с подробным описанием проблемы
