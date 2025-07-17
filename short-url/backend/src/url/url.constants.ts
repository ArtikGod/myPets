import httpStatus from 'http-status';

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal server error',
  ORIGINAL_URL_REQUIRED: 'Original URL is required',
  SHORTEN_FAILED: 'Failed to shorten URL',
  URL_NOT_FOUND: 'URL not found',
  URL_EXPIRED: 'URL has expired',
  ALIAS_IN_USE: 'Alias already in use',
  INVALID_EXPIRATION_DATE: 'Expiration date must be in the future',
};

export const SUCCESS_MESSAGES = {
  SHORTENED: 'URL shortened successfully',
  DELETED: 'URL deleted successfully',
};

export const RESPONSE_KEYS = {
  SUCCESS: 'success',
  MESSAGE: 'message',
  DATA: 'data',
};

export const HTTP_STATUS = {
  OK: httpStatus.OK,
  BAD_REQUEST: httpStatus.BAD_REQUEST,
  NOT_FOUND: httpStatus.NOT_FOUND,
  INTERNAL_SERVER_ERROR: httpStatus.INTERNAL_SERVER_ERROR,
};



