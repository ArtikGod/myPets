export const USERS_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
  },
  PARSING: {
    DECIMAL_RADIX: 10,
  },
  VALIDATION: {
    NAME_MAX_LENGTH: 50,
  },
  DTO: {
    FIRST_NAME_DESCRIPTION: 'Имя пользователя',
    FIRST_NAME_EXAMPLE: 'Иван',
    LAST_NAME_DESCRIPTION: 'Фамилия пользователя',
    LAST_NAME_EXAMPLE: 'Иванов',
    FIRST_NAME_STRING_MESSAGE: 'Имя должно быть строкой',
    FIRST_NAME_MAX_LENGTH_MESSAGE: 'Имя не должно превышать 50 символов',
    LAST_NAME_STRING_MESSAGE: 'Фамилия должна быть строкой',
    LAST_NAME_MAX_LENGTH_MESSAGE: 'Фамилия не должна превышать 50 символов',
  },
  ENTITY: {
    TABLE_NAME: 'users',
    ID_DESCRIPTION: 'ID пользователя',
    EMAIL_DESCRIPTION: 'Email пользователя',
    FIRST_NAME_DESCRIPTION: 'Имя пользователя',
    LAST_NAME_DESCRIPTION: 'Фамилия пользователя',
    CREATED_AT_DESCRIPTION: 'Дата создания',
    UPDATED_AT_DESCRIPTION: 'Дата обновления',
  },
  MESSAGES: {
    USERS_LIST: 'Список пользователей',
    USER_INFO: 'Информация о пользователе',
    USER_UPDATED: 'Пользователь успешно обновлен',
    USER_DELETED: 'Пользователь успешно удален',
    USER_STATS: 'Статистика пользователя',
    USER_NOT_FOUND: 'Пользователь не найден',
    INSUFFICIENT_PERMISSIONS: 'Недостаточно прав для выполнения операции',
  },
  ERRORS: {
    USER_NOT_FOUND: 'Пользователь не найден',
    ACCESS_DENIED: 'Недостаточно прав для выполнения операции',
    UPDATE_ERROR: 'Ошибка при обновлении пользователя',
    DELETE_ERROR: 'Ошибка при удалении пользователя',
  },
};