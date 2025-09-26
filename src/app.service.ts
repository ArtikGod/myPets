import { Injectable } from '@nestjs/common';
import { APP_CONSTANTS } from './common/constants/app.constants';

@Injectable()
export class AppService {
  getAppInfo(): object {
    return {
      success: true,
      message: APP_CONSTANTS.MESSAGES.SERVER_INFO,
      version: APP_CONSTANTS.SWAGGER.VERSION,
      timestamp: new Date().toISOString(),
      features: APP_CONSTANTS.FEATURES
    };
  }

  getHealthCheck(): object {
    return {
      success: true,
      status: APP_CONSTANTS.MESSAGES.HEALTH_CHECK,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version
    };
  }
}