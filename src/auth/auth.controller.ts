import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: AUTH_CONSTANTS.SWAGGER.REGISTER_SUMMARY })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: AUTH_CONSTANTS.MESSAGES.REGISTER_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: AUTH_CONSTANTS.MESSAGES.USER_ALREADY_EXISTS,
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.REGISTER_SUCCESS,
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AUTH_CONSTANTS.SWAGGER.LOGIN_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESS,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AUTH_CONSTANTS.MESSAGES.INVALID_CREDENTIALS,
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.LOGIN_SUCCESS,
      data: result,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AUTH_CONSTANTS.SWAGGER.REFRESH_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_CONSTANTS.MESSAGES.TOKENS_REFRESHED,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AUTH_CONSTANTS.MESSAGES.INVALID_REFRESH_TOKEN,
  })
  async refreshTokens(@Body(AUTH_CONSTANTS.DTO.REFRESH_TOKEN_PARAM) refreshToken: string) {
    const result = await this.authService.refreshTokens(refreshToken);
    return {
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.TOKENS_REFRESHED,
      data: result,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: AUTH_CONSTANTS.SWAGGER.PROFILE_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_CONSTANTS.MESSAGES.PROFILE_DATA,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: AUTH_CONSTANTS.MESSAGES.INVALID_TOKEN,
  })
  async getProfile(@Request() req: { user: User }) {
    return {
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.PROFILE_DATA,
      data: req.user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: AUTH_CONSTANTS.SWAGGER.LOGOUT_SUMMARY })
  @ApiResponse({
    status: HttpStatus.OK,
    description: AUTH_CONSTANTS.MESSAGES.LOGOUT_SUCCESS,
  })
  async logout(
    @Request() req: { user: User },
    @Body(AUTH_CONSTANTS.DTO.REFRESH_TOKEN_PARAM) refreshToken: string,
  ) {
    await this.authService.logout(req.user.id, refreshToken);
    return {
      success: true,
      message: AUTH_CONSTANTS.MESSAGES.LOGOUT_SUCCESS,
    };
  }
}