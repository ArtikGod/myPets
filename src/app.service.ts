import { Injectable } from '@nestjs/common';
import { APP_CONSTANTS } from './common/constants/app.constants';

@Injectable()
export class AppService {
  getHello(): string {
    return APP_CONSTANTS.MESSAGES.APP_RUNNING;
  }

  getHealth(): { status: string; timestamp: string } {
    return {
      status: APP_CONSTANTS.HTTP.HEALTH_STATUS,
      timestamp: new Date().toISOString(),
    };
  }
}
