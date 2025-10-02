export const VOTE_LIMITS = {
  MAX_VOTES_PER_IP: parseInt(process.env.VOTE_LIMIT_PER_IP!)
} as const;

export const ERROR_MESSAGES = {
  VOTE_LIMIT_EXCEEDED: 'Превышен лимит голосов с данного IP-адреса',
  ALREADY_VOTED: 'Вы уже голосовали за эту идею',
  IDEA_NOT_FOUND: 'Идея не найдена',
  INVALID_IDEA_ID: 'Некорректный ID идеи',
  DATABASE_ERROR: 'Ошибка базы данных',
  INTERNAL_ERROR: 'Внутренняя ошибка сервера'
} as const;

export const SUCCESS_MESSAGES = {
  VOTE_RECORDED: 'Голос успешно засчитан'
} as const;

export const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
} as const;

export const LOG_MESSAGES = {
  VOTING_ERROR: 'Ошибка при голосовании:',
  IDEAS_FETCH_ERROR: 'Ошибка при получении идей:',
  SERVER_STARTED: 'Сервер запущен на порту',
  SERVER_STARTING: 'Запуск сервера...',
  NODE_ENV: 'NODE_ENV:'
} as const;

export const IP_VALIDATION = {
  IPV4_REGEX: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  IPV6_REGEX: /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  DEFAULT_IP: '127.0.0.1'
} as const;


export const DATABASE_CONFIG = {
  HOST: process.env.DB_HOST!,
  PORT: parseInt(process.env.DB_PORT!),
  NAME: process.env.DB_NAME!,
  USER: process.env.DB_USER!,
  PASSWORD: process.env.DB_PASSWORD!,
  POOL_MIN: parseInt(process.env.DB_POOL_MIN!),
  POOL_MAX: parseInt(process.env.DB_POOL_MAX!)
} as const;

export const SQL_QUERIES = {
  GET_IDEAS: 'SELECT * FROM ideas ORDER BY votes_count DESC, created_at ASC',
  GET_IDEA_BY_ID: 'SELECT * FROM ideas WHERE id = $1',
  CHECK_VOTE_EXISTS: 'SELECT 1 FROM votes WHERE idea_id = $1 AND ip_address = $2',
  COUNT_VOTES_BY_IP: 'SELECT COUNT(*) as count FROM votes WHERE ip_address = $1',
  INSERT_VOTE: 'INSERT INTO votes (idea_id, ip_address) VALUES ($1, $2)',
  UPDATE_VOTE_COUNT: 'UPDATE ideas SET votes_count = votes_count + 1 WHERE id = $1',
  BEGIN_TRANSACTION: 'BEGIN',
  COMMIT_TRANSACTION: 'COMMIT',
  ROLLBACK_TRANSACTION: 'ROLLBACK',
  DELETE_VOTES: 'DELETE FROM votes',
  DELETE_IDEAS: 'DELETE FROM ideas',
  RESET_SEQUENCE: 'ALTER SEQUENCE ideas_id_seq RESTART WITH 1',
  INSERT_IDEA: 'INSERT INTO ideas (title, description) VALUES ($1, $2)'
} as const;

export const SEED_MESSAGES = {
  STARTING: 'Начинаем заполнение базы данных...',
  SUCCESS: 'Заполнение базы данных завершено успешно!',
  ERROR: 'Ошибка при заполнении базы данных:',
  IDEAS_ADDED: (count: number) => `Добавлено ${count} идей в базу данных`
} as const;