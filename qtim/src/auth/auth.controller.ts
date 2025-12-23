import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { MESSAGE, SUMMARY, ENDPOINT } from '../config/constants.auth.controller';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(ENDPOINT.REGISTER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: SUMMARY.REGISTER })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: MESSAGE.USER_REGISTERED,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: MESSAGE.VALIDATION_ERROR,
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post(ENDPOINT.LOGIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: SUMMARY.LOGIN })
  @ApiResponse({
    status: HttpStatus.OK,
    description: MESSAGE.USER_LOGGED_IN,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: MESSAGE.INVALID_CREDENTIALS,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}