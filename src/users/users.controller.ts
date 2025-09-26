import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';
import { USERS_CONSTANTS } from './constants/users.constants';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USERS_CONSTANTS.MESSAGES.USERS_LIST,
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.usersService.findAll({
      page: page ? parseInt(page, USERS_CONSTANTS.PARSING.DECIMAL_RADIX) : undefined,
      limit: limit ? parseInt(limit, USERS_CONSTANTS.PARSING.DECIMAL_RADIX) : undefined,
    });
    return {
      success: true,
      message: USERS_CONSTANTS.MESSAGES.USERS_LIST,
      ...result,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Получить информацию о текущем пользователе' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USERS_CONSTANTS.MESSAGES.USER_INFO,
  })
  async getCurrentUser(@Request() req: { user: User }) {
    const result = await this.usersService.findOne(req.user.id);
    return {
      success: true,
      message: USERS_CONSTANTS.MESSAGES.USER_INFO,
      data: result,
    };
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Получить статистику текущего пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USERS_CONSTANTS.MESSAGES.USER_STATS,
  })
  async getCurrentUserStats(@Request() req: { user: User }) {
    const result = await this.usersService.getUserStats(req.user.id);
    return {
      success: true,
      message: USERS_CONSTANTS.MESSAGES.USER_STATS,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USERS_CONSTANTS.MESSAGES.USER_INFO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
  })
  @ApiParam({ name: 'id', type: Number })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.usersService.findOne(id);
    return {
      success: true,
      message: USERS_CONSTANTS.MESSAGES.USER_INFO,
      data: result,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить данные пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USERS_CONSTANTS.MESSAGES.USER_UPDATED,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: USERS_CONSTANTS.MESSAGES.INSUFFICIENT_PERMISSIONS,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
  })
  @ApiParam({ name: 'id', type: Number })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: { user: User },
  ) {
    const result = await this.usersService.update(id, updateUserDto, req.user.id);
    return {
      success: true,
      message: USERS_CONSTANTS.MESSAGES.USER_UPDATED,
      data: result,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: USERS_CONSTANTS.MESSAGES.USER_DELETED,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: USERS_CONSTANTS.MESSAGES.INSUFFICIENT_PERMISSIONS,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: USERS_CONSTANTS.MESSAGES.USER_NOT_FOUND,
  })
  @ApiParam({ name: 'id', type: Number })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ) {
    await this.usersService.remove(id, req.user.id);
    return {
      success: true,
      message: USERS_CONSTANTS.MESSAGES.USER_DELETED,
    };
  }
}