import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import httpStatus from 'http-status';
import { ERROR_MESSAGES } from '../constants/errorMessages';

export class ValidationException extends Error {
  constructor(public validationErrors: ValidationError[]) {
    super(ERROR_MESSAGES.VALIDATION.INVALID_REQUEST);
  }
}

export function validationMiddleware<T>(type: any, skipMissingProperties = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoObj = plainToInstance(type, req.body);
    const errors = await validate(dtoObj, { skipMissingProperties });

    if (errors.length > 0) {
      const validationErrors = errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
      }));

      return res.status(httpStatus.BAD_REQUEST).json({
        message: ERROR_MESSAGES.VALIDATION.INVALID_REQUEST,
        errors: validationErrors,
      });
    }

    req.body = dtoObj;
    next();
  };
} 