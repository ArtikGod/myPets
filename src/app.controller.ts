import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { APP_CONSTANTS } from './common/constants/app.constants';

@ApiTags(APP_CONSTANTS.API_TAGS.APP)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: APP_CONSTANTS.API_DESCRIPTIONS.OPERATIONS.APP_INFO })
  @ApiResponse({
    status: APP_CONSTANTS.HTTP.STATUS_CODES.OK,
    description: APP_CONSTANTS.MESSAGES.APP_RUNNING,
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get(APP_CONSTANTS.ROUTES_PATHS.HEALTH)
  @ApiOperation({
    summary: APP_CONSTANTS.API_DESCRIPTIONS.OPERATIONS.HEALTH_CHECK,
  })
  @ApiResponse({
    status: APP_CONSTANTS.HTTP.STATUS_CODES.OK,
    description: APP_CONSTANTS.API_DESCRIPTIONS.OPERATIONS.HEALTH_CHECK_DESC,
  })
  getHealth(): { status: string; timestamp: string } {
    return this.appService.getHealth();
  }
}
