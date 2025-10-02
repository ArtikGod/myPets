export const API_ENDPOINTS = {
  IDEAS: '/api/ideas',
  VOTE: (id: number) => `/api/ideas/${id}/vote`,
  VOTE_STATUS: (id: number) => `/api/ideas/${id}/vote-status`
} as const;

export const UI_MESSAGES = {
  LOADING: 'Загрузка идей...',
  VOTING: 'Голосуем...',
  ERROR_LOADING: 'Ошибка при загрузке идей',
  ERROR_VOTING: 'Ошибка при голосовании',
  VOTE_SUCCESS: 'Голос засчитан!',
  VOTES_PLURAL: (count: number) => {
    if (count % 10 === 1 && count % 100 !== 11) return `${count} голос`;
    if ([2, 3, 4].indexOf(count % 10) !== -1 && [12, 13, 14].indexOf(count % 100) === -1) return `${count} голоса`;
    return `${count} голосов`;
  }
} as const;

export const ERROR_MESSAGES = {
  FAILED_TO_LOAD_IDEAS: 'Не удалось загрузить идеи',
  FAILED_TO_VOTE: 'Не удалось проголосовать',
  VOTING_ERROR_DEFAULT: 'Ошибка при голосовании',
  LOADING_IDEAS_ERROR: 'Ошибка при получении идей:',
  VOTE_STATUS_CHECK_ERROR: 'Ошибка при проверке статуса голосования:'
} as const;

export const VOTE_BUTTON_STATES = {
  AVAILABLE: 'Проголосовать',
  VOTED: 'Уже проголосовали',
  VOTING: 'Голосуем...'
} as const;

export const API_CONFIG = {
  DEFAULT_BASE_URL: 'http://localhost:3001',
  TIMEOUT: 10000
} as const;