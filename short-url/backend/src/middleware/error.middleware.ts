import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES, RESPONSE_KEYS, HTTP_STATUS } from './error.constants.js';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  const status = typeof err.status === 'number' ? err.status : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    typeof err === 'object' && err?.message
      ? err.message
      : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(status).json({ [RESPONSE_KEYS.MESSAGE]: message });
}
