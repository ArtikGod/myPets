const APP_CONSTANTS = {
    PORT: process.env.PORT || 3001,
    NODE_ENV: process.env.NODE_ENV || "development",

    BIG_ORDER_THRESHOLD: 10000,

    SERVER_CONFIG: {
        BODY_LIMIT: "10mb",
        API_VERSION: "1.0.0",
        SEPARATOR_LENGTH: 60,
        CORS_ORIGINS: process.env.CORS_ORIGIN
            ? process.env.CORS_ORIGIN.split(",")
            : ["http://localhost:8080", "http://127.0.0.1:8080"],
    },

    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },

    ERROR_MESSAGES: {
        ORDER_NOT_FOUND: "Заказ не найден",
        EMPTY_ORDER: "Заказ не может быть пустым",
        INVALID_QUANTITY: "Количество товара должно быть больше 0",
        INVALID_CUSTOMER_ID: "ID клиента обязателен",
        INVALID_PRODUCT_ID: "ID товара обязателен",
        INVALID_PRICE: "Цена должна быть положительным числом",
        VALIDATION_ERROR: "Ошибка валидации данных",
        INTERNAL_ERROR: "Внутренняя ошибка сервера",
        MISSING_ITEMS: "Товары обязательны",
        INVALID_ITEMS_ARRAY: "Товары должны быть массивом",
        MISSING_QUANTITY: "Количество обязательно",
        INVALID_QUANTITY_VALUE:
            "Количество должно быть положительным целым числом",
        INVALID_ORDER_ID_FORMAT: "Неверный формат ID заказа",
        MISSING_ORDER_ID: "ID заказа обязателен",
        VALIDATION_ERROR_TITLE: "Ошибка валидации",
        ENDPOINT_NOT_FOUND: "Эндпоинт не найден",
    },

    SUCCESS_MESSAGES: {
        ORDER_CREATED: "Заказ успешно создан",
        ORDER_RETRIEVED: "Заказ получен",
        ORDERS_RETRIEVED: "Список заказов получен",
        ANALYTICS_RETRIEVED: "Аналитика получена",
        WEEKLY_ANALYTICS: "Аналитика за последние 7 дней",
        SUMMARY_ANALYTICS: "Общая аналитика",
        HEALTH_CHECK: "Сервис работает нормально",
        LOG_STATS: "Статистика логов получена",
    },

    ANALYTICS: {
        DAYS_IN_WEEK: 7,
        MILLISECONDS_IN_DAY: 24 * 60 * 60 * 1000,
        MIN_ORDERS_COUNT: 0,
        PERCENTAGE_MULTIPLIER: 100,
    },

    VALIDATION: {
        ITEM_INDEX_OFFSET: 1,
    },

    LOG_LEVELS: {
        INFO: "info",
        ERROR: "error",
        WARN: "warn",
        DEBUG: "debug",
    },

    LOGGER_CONFIG: {
        MAX_LOGS: 1000,
        DEFAULT_RECENT_LIMIT: 50,
        PERCENTAGE_MULTIPLIER: 100,
        COLORS: {
            RESET: "\x1b[0m",
            RED: "\x1b[31m",
            GREEN: "\x1b[32m",
            YELLOW: "\x1b[33m",
            BLUE: "\x1b[34m",
            MAGENTA: "\x1b[35m",
            CYAN: "\x1b[36m",
            WHITE: "\x1b[37m",
        },
    },

    API_ENDPOINTS: {
        ORDERS: "/orders",
        ANALYTICS_WEEKLY: "/analytics/weekly",
        ANALYTICS_SUMMARY: "/analytics/summary",
        HEALTH: "/health",
        LOG_STATS: "/logs/stats",
    },

    CONSOLE_MESSAGES: {
        SERVER_STARTING: "🚀 Запуск сервера управления заказами...",
        SERVER_RUNNING: "✅ Сервер запущен на порту",
        SEPARATOR: "─",
        SYSTEM_INFO: "📋 Информация о системе:",
        NODE_VERSION: "Node.js версия:",
        PLATFORM: "Платформа:",
        MEMORY_USAGE: "Использование памяти:",
        AVAILABLE_ENDPOINTS: "🌐 Доступные эндпоинты:",
        FRONTEND_INFO: "🎨 Фронтенд доступен по адресу: http://localhost:8080",
        READY_MESSAGE: "🎉 Система готова к работе!",
    },

    FRONTEND_CONFIG: {
        API_TIMEOUT: 10000,
        API_BASE_URL: "/api",
        LOCALE: "ru-RU",
        CURRENCY: "RUB",
        ROUTES: {
            HOME: "/",
            ORDERS: "/orders",
            CREATE_ORDER: "/create",
            ORDER_DETAILS: "/order",
            ANALYTICS: "/analytics",
        },
    },

    UI_CONFIG: {
        GRID_COLUMNS: {
            MOBILE: 1,
            TABLET: 2,
            DESKTOP: 3,
        },
        ANIMATION_DURATION: "1s",
        BORDER_RADIUS: {
            SMALL: "4px",
            MEDIUM: "8px",
            LARGE: "12px",
        },
        SPACING: {
            SMALL: "8px",
            MEDIUM: "16px",
            LARGE: "24px",
            XLARGE: "32px",
        },
        FONT_SIZES: {
            SMALL: "14px",
            MEDIUM: "16px",
            LARGE: "18px",
            XLARGE: "24px",
            XXLARGE: "32px",
        },
        COLORS: {
            PRIMARY: "#007bff",
            SUCCESS: "#28a745",
            WARNING: "#ffc107",
            DANGER: "#dc3545",
            LIGHT: "#f8f9fa",
            DARK: "#343a40",
            WHITE: "#ffffff",
            GRAY_100: "#f8f9fa",
            GRAY_200: "#e9ecef",
            GRAY_300: "#dee2e6",
            GRAY_400: "#ced4da",
            GRAY_500: "#adb5bd",
            GRAY_600: "#6c757d",
            GRAY_700: "#495057",
            GRAY_800: "#343a40",
            GRAY_900: "#212529",
        },
        BREAKPOINTS: {
            MOBILE: "768px",
            TABLET: "1024px",
        },
        SHADOWS: {
            SMALL: "0 2px 4px rgba(0,0,0,0.1)",
            MEDIUM: "0 4px 8px rgba(0,0,0,0.1)",
            LARGE: "0 8px 16px rgba(0,0,0,0.1)",
        },
    },
};

module.exports = APP_CONSTANTS;
