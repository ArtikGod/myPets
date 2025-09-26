import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { APP_CONSTANTS } from './common/constants/app.constants';

@ApiTags(APP_CONSTANTS.SWAGGER.TAG)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Получить информацию о приложении' })
  @ApiResponse({ status: HttpStatus.OK, description: APP_CONSTANTS.MESSAGES.SERVER_INFO })
  getHello(): object {
    return this.appService.getAppInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Проверка состояния сервера' })
  @ApiResponse({ status: HttpStatus.OK, description: APP_CONSTANTS.MESSAGES.HEALTH_CHECK })
  getHealth(): object {
    return this.appService.getHealthCheck();
  }
}