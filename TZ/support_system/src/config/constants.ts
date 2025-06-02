export const ERROR_MESSAGES = {
    INVALID_REQUEST: 'Invalid request data',
    APPEAL_NOT_FOUND: 'Appeal not found',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    MISSING_REQUIRED_FIELDS: 'Missing required fields',
    INVALID_DATE_FORMAT: 'Invalid date format, use ISO string',
    TOO_MANY_REQUESTS: 'Too many requests, please try again later',
  };

  export const LIMIT = {
    MAX_RATE: 100,
    TIME: 15 * 60 * 1000,
  }
  
  export const SUCCESS_MESSAGES = {
    APPEAL_CREATED: 'Appeal created successfully',
    STATUS_UPDATED: 'Status updated successfully',
    BATCH_CANCELED: 'All in-progress appeals canceled',
  };
  
  export const APPEAL_STATUS = {
    NEW: 'New',
    IN_PROGRESS: 'InProgress',
    COMPLETED: 'Completed',
    CANCELED: 'Canceled'
  };

  export const VALIDATION_RULES = {
    TOPIC_MIN_LENGTH: 3,
    TOPIC_MAX_LENGTH: 100,
    RESOLUTION_MIN_LENGTH: 10,
    RESOLUTION_MAX_LENGTH: 2000,
  };

  export const VALIDATION_MESSAGES = {
    TOPIC_LENGTH: 'Topic must be between 3-100 characters',
    DESTRUCTION_LENGTH: 'Description must be between 10-2000 characters',
    RESOLUTION_LENGTH: 'Resolution text must be between 10-2000 characters',
    INVALID_ID: 'Invalid appeal ID',
    INVALID_DATE: 'Invalid date format',
  };