export const ERROR_MESSAGES = {
    INVALID_REQUEST: 'Invalid request data',
    APPEAL_NOT_FOUND: 'Appeal not found',
    INVALID_STATUS_TRANSITION: 'Invalid status transition',
    MISSING_REQUIRED_FIELDS: 'Missing required fields',
    INVALID_DATE_FORMAT: 'Invalid date format, use ISO string',
  };
  
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