export const CORS_CONFIG = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
};

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  MESSAGE: 'Слишком много запросов с этого IP, попробуйте позже',
};

export const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
  ALGORITHM: 'HS256',
};

export const BCRYPT_CONFIG = {
  ROUNDS: 12,
};

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const TASK_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
} as const;

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const EXERCISE_CATEGORIES = {
  MEDITATION: 'meditation',
  BREATHING: 'breathing',
  GRATITUDE: 'gratitude',
  MINDFULNESS: 'mindfulness',
  REFLECTION: 'reflection',
  RELAXATION: 'relaxation',
} as const;

export const LOCALES = {
  RU: 'ru',
  EN: 'en',
} as const;

export const DEFAULT_LOCALE = LOCALES.RU;

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;

export const SCHEDULER_CONFIG = {
  DEFAULT_TIME: '09:00',
  DEFAULT_TIMEZONE: 'Europe/Moscow',
};

export const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const AI_CONFIG = {
  MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000,
};

export const API_MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'Пользователь успешно создан',
    USER_UPDATED: 'Пользователь успешно обновлен',
    USER_DELETED: 'Пользователь успешно удален',
    LOGIN_SUCCESS: 'Вход выполнен успешно',
    LOGOUT_SUCCESS: 'Выход выполнен успешно',
    TASK_COMPLETED: 'Задание отмечено как выполненное',
    TASK_SKIPPED: 'Задание пропущено',
    EXERCISE_CREATED: 'Упражнение создано успешно',
    EXERCISE_UPDATED: 'Упражнение обновлено успешно',
    EXERCISE_DELETED: 'Упражнение удалено успешно',
    CUSTOM_TASK_CREATED: 'Пользовательское задание создано',
    CUSTOM_TASK_UPDATED: 'Пользовательское задание обновлено',
    CUSTOM_TASK_DELETED: 'Пользовательское задание удалено',
    CUSTOM_TASK_COMPLETED: 'Пользовательское задание выполнено',
    VOTE_RECORDED: 'Голос записан',
  },
  ERROR: {
    UNAUTHORIZED: 'Необходима авторизация',
    FORBIDDEN: 'Недостаточно прав доступа',
    NOT_FOUND: 'Ресурс не найден',
    VALIDATION_ERROR: 'Ошибка валидации данных',
    INTERNAL_ERROR: 'Внутренняя ошибка сервера',
    USER_EXISTS: 'Пользователь с таким email уже существует',
    EMAIL_ALREADY_EXISTS: 'Пользователь с таким email уже существует',
    USER_ALREADY_EXISTS: 'Пользователь уже существует',
    USER_NOT_FOUND: 'Пользователь не найден',
    INVALID_CREDENTIALS: 'Неверный email или пароль',
    INVALID_TOKEN: 'Недействительный токен',
    EXPIRED_TOKEN: 'Токен истек',
    TOKEN_EXPIRED: 'Токен истек',
    TASK_NOT_FOUND: 'Задание не найдено',
    EXERCISE_NOT_FOUND: 'Упражнение не найдено',
    CUSTOM_TASK_NOT_FOUND: 'Пользовательское задание не найдено',
    DATABASE_ERROR: 'Ошибка базы данных',
    AI_SERVICE_ERROR: 'Ошибка AI сервиса',
    CANNOT_EDIT_COMPLETED_TASK: 'Нельзя редактировать выполненное задание',
    CANNOT_DELETE_COMPLETED_TASK: 'Нельзя удалить выполненное задание',
    TASK_ALREADY_COMPLETED: 'Задание уже выполнено',
    ADMIN_REQUIRED: 'Требуются права администратора',
    IDEA_NOT_FOUND: 'Идея не найдена',
    INVALID_IDEA_ID: 'Неверный ID идеи',
    ALREADY_VOTED: 'Вы уже проголосовали',
    VOTE_LIMIT_EXCEEDED: 'Превышен лимит голосов',
  },
};

export const ERROR_MESSAGES = API_MESSAGES.ERROR;

export const SUCCESS_MESSAGES = API_MESSAGES.SUCCESS;

export const EXERCISE_CREATED = API_MESSAGES.SUCCESS.EXERCISE_CREATED;
export const CUSTOM_TASK_CREATED = API_MESSAGES.SUCCESS.CUSTOM_TASK_CREATED;
export const CUSTOM_TASK_UPDATED = API_MESSAGES.SUCCESS.CUSTOM_TASK_UPDATED;
export const CUSTOM_TASK_DELETED = API_MESSAGES.SUCCESS.CUSTOM_TASK_DELETED;
export const CUSTOM_TASK_COMPLETED = API_MESSAGES.SUCCESS.CUSTOM_TASK_COMPLETED;

export const INTERNAL_ERROR = API_MESSAGES.ERROR.INTERNAL_ERROR;
export const CUSTOM_TASK_NOT_FOUND = API_MESSAGES.ERROR.CUSTOM_TASK_NOT_FOUND;
export const CANNOT_EDIT_COMPLETED_TASK = API_MESSAGES.ERROR.CANNOT_EDIT_COMPLETED_TASK;
export const CANNOT_DELETE_COMPLETED_TASK = API_MESSAGES.ERROR.CANNOT_DELETE_COMPLETED_TASK;
export const TASK_ALREADY_COMPLETED = API_MESSAGES.ERROR.TASK_ALREADY_COMPLETED;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const AI_CATEGORIES = [
  { key: 'meditation', name: 'Медитация', nameEn: 'Meditation' },
  { key: 'breathing', name: 'Дыхательные упражнения', nameEn: 'Breathing Exercises' },
  { key: 'gratitude', name: 'Благодарность', nameEn: 'Gratitude' },
  { key: 'mindfulness', name: 'Осознанность', nameEn: 'Mindfulness' },
  { key: 'reflection', name: 'Рефлексия', nameEn: 'Reflection' },
  { key: 'relaxation', name: 'Расслабление', nameEn: 'Relaxation' },
];

export const AI_PROMPTS = {
  meditation: [
    'Создай 5-минутное упражнение медитации для начинающих',
    'Разработай медитацию на концентрацию внимания',
    'Создай упражнение медитации для снятия стресса',
  ],
  breathing: [
    'Создай дыхательное упражнение для успокоения',
    'Разработай технику дыхания для повышения энергии',
    'Создай упражнение дыхания для лучшего сна',
  ],
  gratitude: [
    'Создай упражнение благодарности на день',
    'Разработай практику признательности',
    'Создай упражнение для развития позитивного мышления',
  ],
  mindfulness: [
    'Создай упражнение осознанности для повседневной жизни',
    'Разработай практику внимательного наблюдения',
    'Создай упражнение для развития присутствия в моменте',
  ],
  reflection: [
    'Создай упражнение для самоанализа',
    'Разработай практику рефлексии дня',
    'Создай упражнение для понимания эмоций',
  ],
  relaxation: [
    'Создай упражнение для глубокого расслабления',
    'Разработай технику снятия мышечного напряжения',
    'Создай упражнение для релаксации перед сном',
  ],
};