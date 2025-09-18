// API URLs
export const API = {
  WILDBERRIES: {
    TARIFFS_URL: 'https://common-api.wildberries.ru/api/v1/tariffs/box',
    HEADERS: {
      CONTENT_TYPE: 'application/json',
      AUTHORIZATION: 'Bearer'
    },
    PARAMS: {
      DATE_PARAM: 'date'
    }
  }
};

// Database
export const DATABASE = {
  CLIENT: 'pg',
  TABLE: {
    TARIFFS: 'tariffs'
  },
  QUERY: {
    HEALTH_CHECK: 'SELECT 1'
  },
  SQL: {
    EXCLUDED: {
      BOX_DELIVERY_BASE: 'EXCLUDED.box_delivery_base',
      BOX_DELIVERY_COEF_EXPR: 'EXCLUDED.box_delivery_coef_expr',
      BOX_DELIVERY_LITER: 'EXCLUDED.box_delivery_liter',
      BOX_DELIVERY_MARKETPLACE_BASE: 'EXCLUDED.box_delivery_marketplace_base',
      BOX_DELIVERY_MARKETPLACE_COEF_EXPR: 'EXCLUDED.box_delivery_marketplace_coef_expr',
      BOX_DELIVERY_MARKETPLACE_LITER: 'EXCLUDED.box_delivery_marketplace_liter',
      BOX_STORAGE_BASE: 'EXCLUDED.box_storage_base',
      BOX_STORAGE_COEF_EXPR: 'EXCLUDED.box_storage_coef_expr',
      BOX_STORAGE_LITER: 'EXCLUDED.box_storage_liter',
      DT_NEXT_BOX: 'EXCLUDED.dt_next_box',
      DT_TILL_MAX: 'EXCLUDED.dt_till_max'
    },
    ALIAS: {
      MAX_DATE: 'max_date'
    }
  },
  COLUMN: {
    ID: 'id',
    DATE: 'date',
    CREATED_AT: 'created_at',
    UPDATED_AT: 'updated_at',
    WAREHOUSE_NAME: 'warehouse_name',
    GEO_NAME: 'geo_name',
    BOX_DELIVERY_BASE: 'box_delivery_base',
    BOX_DELIVERY_COEF_EXPR: 'box_delivery_coef_expr',
    BOX_DELIVERY_LITER: 'box_delivery_liter',
    BOX_DELIVERY_MARKETPLACE_BASE: 'box_delivery_marketplace_base',
    BOX_DELIVERY_MARKETPLACE_COEF_EXPR: 'box_delivery_marketplace_coef_expr',
    BOX_DELIVERY_MARKETPLACE_LITER: 'box_delivery_marketplace_liter',
    BOX_STORAGE_BASE: 'box_storage_base',
    BOX_STORAGE_COEF_EXPR: 'box_storage_coef_expr',
    BOX_STORAGE_LITER: 'box_storage_liter',
    DT_NEXT_BOX: 'dt_next_box',
    DT_TILL_MAX: 'dt_till_max'
  },
  POOL: {
    MIN: 2,
    MAX: 10
  },
  DECIMAL: {
    // Удалены старые константы COEFFICIENT и PRICE, так как эти поля больше не используются
  },
  MIGRATIONS: {
    DIRECTORY: './src/migrations',
    EXTENSION: 'ts'
  },
  INDEX: {
    UNIQUE_CONSTRAINT: 'tariffs_warehouse_geo_date_unique',
    DATE_INDEX: 'tariffs_date_index',
    WAREHOUSE_NAME_INDEX: 'tariffs_warehouse_name_index'
  }
};

// Google Sheets
export const GOOGLE_SHEETS = {
  SCOPES: ['https://www.googleapis.com/auth/spreadsheets'],
  VERSION: 'v4',
  SHEET: {
    STOCKS_COEFS: 'stocks_coefs',
    RANGE: {
      ALL: 'A:Z',
      CLEAR_RANGE: 'A:Z',
      START_CELL: 'A1'
    },
    HEADERS: [
      'Склад',
      'Доставка база',
      'Доставка коэф экспресс',
      'Доставка за литр',
      'Маркетплейс база',
      'Маркетплейс коэф экспресс',
      'Маркетплейс за литр',
      'Хранение база',
      'Хранение коэф экспресс',
      'Хранение за литр'
    ],
    VALUE_INPUT_OPTION: 'RAW'
  }
};

// Cron expressions
export const CRON = {
  FETCH_TARIFFS: '* * * * *',
  SYNC_SHEETS: '* * * * *'
};

// Log messages
export const LOG = {
  DB: {
    CONNECTION_SUCCESS: 'Подключение к базе данных установлено',
    MIGRATIONS_DONE: 'Миграции выполнены',
    TARIFFS_UPDATED: (count: number) => `✅ Обновлено ${count} тарифов в базе данных`,
    ERROR_UPDATING: '❌ Ошибка при обновлении тарифов:'
  },
  WB: {
    FETCH_START: 'Начинаем получение тарифов Wildberries...',
    FETCH_SUCCESS: (count: number) => `Тарифы успешно обновлены: ${count} записей`,
    FETCH_ERROR: 'Ошибка при обновлении тарифов:',
    API_ERROR: 'Не удалось получить тарифы от Wildberries API',
    EMPTY_RESPONSE: 'WB API вернул пустой или неожиданный ответ',
    HTTP_ERROR: (status: number, statusText: string) => `📊 HTTP ${status}: ${statusText}`,
    ERROR_BODY: '📦 Тело ошибки:',
    BAD_REQUEST_REASONS: '💡 Возможные причины ошибки 400:',
    BAD_REQUEST_DATE_FORMAT: '   - Неверный формат параметра date',
    BAD_REQUEST_MISSING_PARAM: '   - Отсутствует обязательный параметр',
    BAD_REQUEST_INVALID_TOKEN: '   - Неверный токен авторизации',
    UNAUTHORIZED_ERROR: '💡 Ошибка авторизации - проверьте токен WB_API_TOKEN',
    RATE_LIMIT_ERROR: '💡 Превышен лимит запросов - подождите перед следующим запросом',
    NETWORK_ERROR: '🌐 Сетевая ошибка - запрос не дошел до сервера',
    CONFIG_ERROR: '⚙️ Ошибка конфигурации запроса:',
    RAW_RESPONSE_ERROR: '❌ Ошибка получения сырого ответа:'
  },
  SHEETS: {
    SYNC_START: 'Начинаем синхронизацию с Google Sheets...',
    SYNC_SUCCESS: 'Синхронизация с Google Sheets завершена',
    SHEET_UPDATED: (id: string) => `✅ Обновлен Google Sheet: ${id}`,
    SHEET_ERROR: (id: string) => `❌ Ошибка при обновлении Google Sheet ${id}:`,
    NO_DATA: 'Нет данных для синхронизации',
    NO_SHEETS_FOUND: 'Не найдено ни одного листа в таблице',
    UPDATE_ERROR: (id: string) => `❌ Ошибка при обновлении таблицы ${id}:`
  },
  APP: {
    START_SUCCESS: 'Приложение запущено успешно',
    START_ERROR: 'Ошибка при запуске приложения:',
    SHUTDOWN: (signal: string) => `Получен сигнал ${signal}, завершаем работу...`,
    CRON_TARIFFS_SCHEDULED: (expr: string) => `Запланировано получение тарифов: ${expr}`,
    CRON_SHEETS_SCHEDULED: (expr: string) => `Запланирована синхронизация с Google Sheets: ${expr}`,
    UNHANDLED_REJECTION: 'Unhandled Rejection:',
    UNCAUGHT_EXCEPTION: 'Uncaught Exception:'
  }
};

// Default values
export const DEFAULTS = {
  DB: {
    HOST: 'localhost',
    PORT: '5432',
    NAME: 'wb_tariffs',
    USER: 'postgres',
    PASSWORD: 'password'
  },
  GOOGLE: {
    CREDENTIALS_PATH: 'secrets/google.json'
  }
};

// Форматы и разделители
export const FORMAT = {
  DATE: {
    ISO_DATE_ONLY: 'T',
    DECIMAL_SEPARATOR: ',',
    DECIMAL_REPLACEMENT: '.'
  },
  TOKEN: {
    MASK_LENGTH: 20,
    MASK_SUFFIX: '...'
  }
};

// HTTP статусы и коды ошибок
export const HTTP = {
  STATUS: {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    TOO_MANY_REQUESTS: 429
  },
  HEADERS: {
    AUTHORIZATION: 'Authorization',
    CONTENT_TYPE: 'Content-Type'
  }
};

// Системные сигналы и события
export const SIGNALS = {
  SIGINT: 'SIGINT',
  SIGTERM: 'SIGTERM'
};

export const PROCESS_EVENTS = {
  UNHANDLED_REJECTION: 'unhandledRejection',
  UNCAUGHT_EXCEPTION: 'uncaughtException'
};

// Числовые константы
export const NUMBERS = {
  FIRST_INDEX: 0,
  ARRAY_SLICE_LIMIT: 3,
  FIRST_ELEMENT: 1
};

// Строковые константы
export const STRINGS = {
  EMPTY: '',
  DASH: '-',
  COMMA: ',',
  SPACE: ' ',
  UNKNOWN: 'неизвестно'
};