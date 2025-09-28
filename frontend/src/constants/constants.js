// API Configuration
export const API_CONFIG = {
    BASE_URL: "/api",
    TIMEOUT: 10000,
    HEADERS: {
        CONTENT_TYPE: "application/json",
    },
};

// API Endpoints
export const API_ENDPOINTS = {
    ORDERS: "/orders",
    ANALYTICS: {
        WEEKLY: "/analytics/weekly",
        SUMMARY: "/analytics/summary",
    },
    SYSTEM: {
        HEALTH: "/health",
        LOG_STATS: "/logs/stats",
    },
};

// Error Messages
export const ERROR_MESSAGES = {
    ORDER: {
        CREATE: "Ошибка при создании заказа",
        GET: "Ошибка при получении заказа",
        GET_ALL: "Ошибка при получении списка заказов",
    },
    ANALYTICS: {
        WEEKLY: "Ошибка при получении аналитики",
        SUMMARY: "Ошибка при получении общей аналитики",
    },
    SYSTEM: {
        SERVICE_UNAVAILABLE: "Сервис недоступен",
        LOG_STATS: "Ошибка при получении статистики логов",
    },
};

// Localization Settings
export const LOCALE_CONFIG = {
    LOCALE: "ru-RU",
    CURRENCY: "RUB",
    DATE_FORMAT: {
        FULL: {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
        SHORT: {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    },
};
