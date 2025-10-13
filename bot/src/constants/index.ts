export const BOT_COMMANDS = {
  START: 'start',
  HELP: 'help',
  TODAY: 'today',
  DONE: 'done',
  PROGRESS: 'progress',
  SETTINGS: 'settings',
  CUSTOM: 'custom',
} as const;

export const MESSAGES = {
  RU: {
    WELCOME: '👋 Добро пожаловать в психолог-бота!\n\nЯ помогу вам улучшить эмоциональное состояние с помощью ежедневных психологических упражнений.\n\nДля начала работы мне нужна ваша информация.',
    ASK_NAME: '📝 Как вас зовут?',
    ASK_EMAIL: '📧 Укажите ваш email:',
    REGISTRATION_SUCCESS: '✅ Регистрация прошла успешно!\n\nТеперь вы будете получать ежедневные задания каждое утро в 09:00.\n\nИспользуйте /today чтобы получить задание на сегодня.',
    REGISTRATION_ERROR: '❌ Ошибка регистрации. Попробуйте позже.',
    
    HELP: `🤖 *Доступные команды:*

/start - Начать работу с ботом
/today - Получить задание на сегодня
/done - Отметить задание как выполненное
/progress - Посмотреть свой прогресс
/settings - Настройки
/custom - Пользовательские задания
/help - Показать эту справку

💡 *Как это работает:*
• Каждое утро в 09:00 вы получаете новое психологическое упражнение
• Выполните упражнение и отметьте его командой /done
• Следите за своим прогрессом командой /progress
• Настройте язык и время в /settings`,

    TODAY_TASK: '📋 *Задание на сегодня:*\n\n*{title}*\n\n{description}\n\n💡 После выполнения используйте команду /done',
    NO_TASK_TODAY: '🤷‍♂️ На сегодня заданий нет. Возможно, все упражнения неактивны.',
    
    TASK_COMPLETED: '✅ Отлично! Задание отмечено как выполненное.\n\n🎉 Продолжайте в том же духе!',
    TASK_ALREADY_COMPLETED: '✅ Это задание уже выполнено.',
    TASK_NOT_FOUND: '❌ Задание не найдено.',
    
    PROGRESS_TITLE: '📊 *Ваш прогресс:*\n\n',
    PROGRESS_TODAY: '📅 *Сегодня:*\nПолучено: {received} | Выполнено: {completed} | Процент: {rate}%\n\n',
    PROGRESS_WEEK: '📅 *За неделю:*\nПолучено: {received} | Выполнено: {completed} | Процент: {rate}%\nТекущая серия: {streak} дней\n\n',
    PROGRESS_MONTH: '📅 *За месяц:*\nПолучено: {received} | Выполнено: {completed} | Процент: {rate}%\n\n',
    PROGRESS_TOTAL: '📅 *Всего:*\nПолучено: {received} | Выполнено: {completed} | Процент: {rate}%\nМаксимальная серия: {streak} дней',
    
    SETTINGS_MENU: '⚙️ *Настройки:*\n\nВыберите что хотите изменить:',
    LANGUAGE_CHANGED: '✅ Язык изменен на русский',
    TIMEZONE_CHANGED: '✅ Часовой пояс обновлен',
    
    USER_NOT_REGISTERED: '❌ Вы не зарегистрированы. Используйте команду /start',
    ERROR_OCCURRED: '❌ Произошла ошибка. Попробуйте позже.',
    INVALID_EMAIL: '❌ Некорректный email. Попробуйте еще раз.',
    
    CUSTOM_TASKS_INFO: '📝 *Пользовательские задания*\n\nЗдесь вы можете создавать свои собственные упражнения.\n\nФункция будет доступна в ближайшее время!',
  },
  
  EN: {
    WELCOME: '👋 Welcome to Psychology Bot!\n\nI will help you improve your emotional state with daily psychological exercises.\n\nTo get started, I need your information.',
    ASK_NAME: '📝 What is your name?',
    ASK_EMAIL: '📧 Please provide your email:',
    REGISTRATION_SUCCESS: '✅ Registration successful!\n\nYou will now receive daily tasks every morning at 09:00.\n\nUse /today to get today\'s task.',
    REGISTRATION_ERROR: '❌ Registration error. Please try again later.',
    
    HELP: `🤖 *Available commands:*

/start - Start working with the bot
/today - Get today's task
/done - Mark task as completed
/progress - View your progress
/settings - Settings
/custom - Custom tasks
/help - Show this help

💡 *How it works:*
• Every morning at 09:00 you receive a new psychological exercise
• Complete the exercise and mark it with /done command
• Track your progress with /progress command
• Configure language and time in /settings`,

    TODAY_TASK: '📋 *Today\'s task:*\n\n*{title}*\n\n{description}\n\n💡 After completion, use /done command',
    NO_TASK_TODAY: '🤷‍♂️ No tasks for today. Maybe all exercises are inactive.',
    
    TASK_COMPLETED: '✅ Great! Task marked as completed.\n\n🎉 Keep up the good work!',
    TASK_ALREADY_COMPLETED: '✅ This task is already completed.',
    TASK_NOT_FOUND: '❌ Task not found.',
    
    PROGRESS_TITLE: '📊 *Your progress:*\n\n',
    PROGRESS_TODAY: '📅 *Today:*\nReceived: {received} | Completed: {completed} | Rate: {rate}%\n\n',
    PROGRESS_WEEK: '📅 *This week:*\nReceived: {received} | Completed: {completed} | Rate: {rate}%\nCurrent streak: {streak} days\n\n',
    PROGRESS_MONTH: '📅 *This month:*\nReceived: {received} | Completed: {completed} | Rate: {rate}%\n\n',
    PROGRESS_TOTAL: '📅 *Total:*\nReceived: {received} | Completed: {completed} | Rate: {rate}%\nLongest streak: {streak} days',
    
    SETTINGS_MENU: '⚙️ *Settings:*\n\nChoose what you want to change:',
    LANGUAGE_CHANGED: '✅ Language changed to English',
    TIMEZONE_CHANGED: '✅ Timezone updated',
    
    USER_NOT_REGISTERED: '❌ You are not registered. Use /start command',
    ERROR_OCCURRED: '❌ An error occurred. Please try again later.',
    INVALID_EMAIL: '❌ Invalid email. Please try again.',
    
    CUSTOM_TASKS_INFO: '📝 *Custom Tasks*\n\nHere you can create your own exercises.\n\nThis feature will be available soon!',
  },
} as const;

export const KEYBOARDS = {
  RU: {
    SETTINGS: [
      [{ text: '🌍 Изменить язык', callback_data: 'change_language' }],
      [{ text: '🕐 Изменить время', callback_data: 'change_timezone' }],
      [{ text: '❌ Закрыть', callback_data: 'close' }],
    ],
    LANGUAGE: [
      [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }],
      [{ text: '🇺🇸 English', callback_data: 'lang_en' }],
      [{ text: '⬅️ Назад', callback_data: 'back_settings' }],
    ],
  },
  
  EN: {
    SETTINGS: [
      [{ text: '🌍 Change language', callback_data: 'change_language' }],
      [{ text: '🕐 Change time', callback_data: 'change_timezone' }],
      [{ text: '❌ Close', callback_data: 'close' }],
    ],
    LANGUAGE: [
      [{ text: '🇷🇺 Русский', callback_data: 'lang_ru' }],
      [{ text: '🇺🇸 English', callback_data: 'lang_en' }],
      [{ text: '⬅️ Back', callback_data: 'back_settings' }],
    ],
  },
} as const;

export const REGISTRATION_STATES = {
  WAITING_NAME: 'waiting_name',
  WAITING_EMAIL: 'waiting_email',
} as const;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SUPPORTED_LOCALES = ['ru', 'en'] as const;

export const DEFAULT_LOCALE = 'ru' as const;

export const API_ERRORS = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  REGISTRATION_ERROR: 'REGISTRATION_ERROR',
} as const;