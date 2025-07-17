export const DEFAULT_API_URL = 'http://localhost:3000';

export const ERROR_MESSAGES = {
  DEFAULT: 'Something went wrong',
  FETCH_URLS: 'Failed to fetch URLs',
  CREATE_URL: 'Failed to create URL',
  DELETE_URL: 'Failed to delete URL',
  URL_NOT_FOUND: 'URL not found',
  ANALYTICS_NOT_FOUND: 'Analytics not found',
};

export const API_PATHS = {
  SHORTEN: '/urls/shorten',
  ALL_URLS: '/urls',
  INFO: '/urls/info',
  ANALYTICS: '/analytics',
  DELETE: '/urls/delete',
};
