import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { APP_CONSTANTS } from '../constants/app.constants';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | object;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === APP_CONSTANTS.TYPES.STRING
          ? exceptionResponse
          : exceptionResponse;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = APP_CONSTANTS.ERROR_MESSAGES.INTERNAL_ERROR;

      this.logger.error(
        `${APP_CONSTANTS.LOGGING.MESSAGES.UNEXPECTED_ERROR} ${exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    if (status >= APP_CONSTANTS.HTTP_THRESHOLDS.ERROR_STATUS_MIN) {
      this.logger.warn(
        `${APP_CONSTANTS.LOGGING.MESSAGES.HTTP_PREFIX} ${status} ${APP_CONSTANTS.LOGGING.MESSAGES.ERROR_SUFFIX} ${request.method} ${request.url}`,
        JSON.stringify(errorResponse),
      );
    }

    response.status(status).json(errorResponse);
  }
}
