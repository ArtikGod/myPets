export const APP_CONSTANTS = {
  // Application Configuration
  DEFAULT_PORT: 3000,

  // Cache Configuration
  CACHE_TTL: 300,
  CACHE_KEYS: {
    USER_BALANCE: (userId: number) => `user_balance_${userId}`,
  },

  // Business Logic
  MIN_AMOUNT: 0.01,
  DECIMAL_PRECISION: 10,
  DECIMAL_SCALE: 2,
  DEFAULT_HISTORY_LIMIT: 50,
  MAX_HISTORY_LIMIT: 1000,

  // Database Configuration
  DATABASE: {
    TYPE_POSTGRES: 'postgres',
    SYNCHRONIZE_FALSE: false,
    NODE_ENV_DEVELOPMENT: 'development',
    MIGRATIONS_PATH: 'src/migrations/*.ts',
    ENTITIES_PATTERN: '**/*.entity{.ts,.js}',
    LOCK_MODE: 'pessimistic_write',
    ORDER_DESC: 'DESC',
    ORDER_ASC: 'ASC',
    MANAGER: 'manager',
    TABLES: {
      USERS: 'users',
      PAYMENT_HISTORY: 'payment_history',
    },
    FIELDS: {
      ID: 'id',
      USER_ID: 'userId',
      BALANCE: 'balance',
      TIMESTAMP: 'ts',
    },
    COLUMN_TYPES: {
      DECIMAL: 'decimal',
      ENUM: 'enum',
    },
    RELATIONS: {
      USER_ENTITY: 'User',
      PAYMENT_HISTORY_ENTITY: 'PaymentHistory',
      USER_RELATION: 'user',
      PAYMENT_HISTORY_RELATION: 'paymentHistory',
    },
  },

  // Payment Actions
  PAYMENT_ACTIONS: {
    DEBIT: 'debit',
    CREDIT: 'credit',
  },

  // HTTP Configuration
  HTTP: {
    STATUS_CODES: {
      OK: 200,
      CREATED: 201,
      BAD_REQUEST: 400,
      NOT_FOUND: 404,
    },
    HEALTH_STATUS: 'OK',
    SUCCESS_MESSAGE: 'Операция выполнена успешно',
    ERROR_STATUS_MIN: 400,
  },

  // HTTP Thresholds (for backward compatibility)
  HTTP_THRESHOLDS: {
    ERROR_STATUS_MIN: 400,
  },

  // Routes
  ROUTES: {
    BALANCE: 'balance',
    DEBIT: 'debit',
    USER_BY_ID: 'user/:userId',
    HISTORY_BY_ID: 'history/:userId',
    USER: 'user',
    HEALTH: 'health',
  },

  // Route Paths (for backward compatibility)
  ROUTES_PATHS: {
    HEALTH: 'health',
  },

  // Request Parameters
  PARAMS: {
    USER_ID: 'userId',
    LIMIT: 'limit',
    INITIAL_BALANCE: 'initialBalance',
  },

  // Default Values
  DEFAULTS: {
    INITIAL_BALANCE: 0,
    BALANCE_ZERO: 0,
    SUCCESS_TRUE: true,
    ACTION_DEBIT: 'debit',
  },

  // Swagger Configuration
  SWAGGER: {
    TITLE: 'Balance Server API',
    DESCRIPTION: 'API для управления балансом пользователей',
    VERSION: '1.0',
    TAG: 'balance',
    PATH: 'api',
  },

  // API Tags
  API_TAGS: {
    APP: 'app',
  },

  // Error Messages
  ERROR_MESSAGES: {
    USER_NOT_FOUND: (userId: number) => `Пользователь с ID ${userId} не найден`,
    INSUFFICIENT_FUNDS: (balance: number, required: number) =>
      `Недостаточно средств. Текущий баланс: ${balance}, требуется: ${required}`,
    INVALID_AMOUNT: 'Сумма должна быть положительным числом',
    MIN_AMOUNT_ERROR: `Минимальная сумма для операции: ${0.01}`,
    INTERNAL_ERROR: 'Внутренняя ошибка сервера',
  },

  // Validation Messages
  VALIDATION_MESSAGES: {
    USER_ID_NUMBER: 'userId должен быть числом',
    AMOUNT_NUMBER: 'amount должен быть числом',
    DESCRIPTION_STRING: 'description должен быть строкой',
  },

  // Operation Descriptions
  OPERATION_DESCRIPTIONS: {
    INITIAL_BALANCE: 'Начальный баланс',
    DEBIT_DEFAULT: 'Списание средств',
    CREDIT_DEFAULT: 'Пополнение средств',
  },

  // API Descriptions
  API_DESCRIPTIONS: {
    USER_ID: 'ID пользователя',
    AMOUNT: 'Сумма для списания',
    DESCRIPTION: 'Описание операции',
    INITIAL_BALANCE: 'Начальный баланс пользователя',

    ENTITY_DESCRIPTIONS: {
      USER_ID: 'Уникальный идентификатор пользователя',
      USER_BALANCE: 'Баланс пользователя',
      CREATED_AT: 'Дата создания записи',
      UPDATED_AT: 'Дата последнего обновления записи',
      PAYMENT_ID: 'Уникальный идентификатор записи',
      PAYMENT_USER_ID: 'ID пользователя',
      PAYMENT_ACTION: 'Тип операции',
      PAYMENT_AMOUNT: 'Сумма операции',
      PAYMENT_TIMESTAMP: 'Временная метка операции',
      PAYMENT_DESCRIPTION: 'Описание операции',
    },

    OPERATIONS: {
      DEBIT_BALANCE: 'Списание баланса пользователя',
      DEBIT_BALANCE_DESC:
        'Списывает указанную сумму с баланса пользователя и создает запись в истории платежей',
      GET_BALANCE: 'Получение текущего баланса пользователя',
      GET_BALANCE_DESC: 'Возвращает текущий баланс указанного пользователя',
      GET_HISTORY: 'Получение истории платежей пользователя',
      GET_HISTORY_DESC:
        'Возвращает историю всех операций с балансом указанного пользователя',
      CREATE_USER: 'Создание нового пользователя (для тестирования)',
      CREATE_USER_DESC:
        'Создает нового пользователя с указанным начальным балансом',
      APP_INFO: 'Получить информацию о приложении',
      HEALTH_CHECK: 'Проверка состояния приложения',
      HEALTH_CHECK_DESC: 'Приложение работает',
    },

    EXAMPLES: {
      USER_ID: 1,
      AMOUNT: 100.5,
      DESCRIPTION: 'Покупка товара',
      INITIAL_BALANCE: 1000.0,
      PREVIOUS_BALANCE: 1000.5,
      NEW_BALANCE: 900.5,
      TRANSACTION_ID: 123,
      TIMESTAMP: '2024-01-01T12:00:00.000Z',
      BALANCE_EXAMPLE: 1000.5,
      PAYMENT_AMOUNT: 100.5,
    },

    RESPONSES: {
      SUCCESS: 'Операция выполнена успешно',
      USER_BALANCE: 'Баланс пользователя',
      PAYMENT_HISTORY: 'История платежей пользователя',
      USER_CREATED: 'Пользователь создан',
      BALANCE_DEBITED: 'Баланс успешно списан',
      BAD_REQUEST: 'Недостаточно средств или некорректные данные',
      NOT_FOUND: 'Пользователь не найден',
      LIMIT_PARAM: 'Количество записей для возврата',
    },
  },

  // Application Messages
  MESSAGES: {
    APP_RUNNING: 'Balance Server API работает!',
    APP_STARTED: 'Приложение запущено на порту',
    SWAGGER_AVAILABLE:
      'Swagger документация доступна по адресу: http://localhost:',
  },

  // Schema Properties
  SCHEMA_PROPERTIES: {
    SUCCESS: 'success',
    USER_ID: 'userId',
    PREVIOUS_BALANCE: 'previousBalance',
    NEW_BALANCE: 'newBalance',
    DEBITED_AMOUNT: 'debitedAmount',
    TRANSACTION_ID: 'transactionId',
    TIMESTAMP: 'timestamp',
    BALANCE: 'balance',
    ID: 'id',
    ACTION: 'action',
    AMOUNT: 'amount',
    DESCRIPTION: 'description',
    TS: 'ts',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
  },

  // Logging Configuration
  LOGGING: {
    LEVELS: {
      ERROR: 'error',
      WARN: 'warn',
      INFO: 'info',
      DEBUG: 'debug',
    },
    MESSAGES: {
      UNEXPECTED_ERROR: 'Неожиданная ошибка:',
      HTTP_PREFIX: 'HTTP',
      ERROR_SUFFIX: 'Error:',
    },
  },

  // Validation Configuration
  VALIDATION: {
    WHITELIST: true,
    FORBID_NON_WHITELISTED: true,
    TRANSFORM: true,
  },

  // Module Configuration
  CONFIG: {
    IS_GLOBAL: true,
  },

  // CORS Configuration
  CORS: {
    ENABLED: true,
  },

  // Environment Configuration
  ENVIRONMENT: {
    PRODUCTION: 'production',
    DEVELOPMENT: 'development',
  },

  // Type Definitions
  TYPES: {
    STRING: 'string',
  },
} as const;

export type CacheKey = ReturnType<typeof APP_CONSTANTS.CACHE_KEYS.USER_BALANCE>;
export type ErrorMessage = ReturnType<
  typeof APP_CONSTANTS.ERROR_MESSAGES.USER_NOT_FOUND
>;
