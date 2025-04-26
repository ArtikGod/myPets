import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { BlacklistService } from './blacklist.service';
import { ERROR_MESSAGES, AUTH_HEADER, MILLISECONDS_IN_SECOND } from '../shared/constants';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly blacklistService: BlacklistService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignUpDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  async signin(@Body() dto: SignInDto) {
    return this.authService.signin(dto);
  }

  @Post('signin/new_token')
  async refresh(@Body('refreshToken') token: string) {
  return this.authService.refreshAccessToken(token);
}

@UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() req: Request) {
  const authHeader = req.headers[AUTH_HEADER];
  const token = authHeader?.split(' ')[1];

  const decoded = this.jwtService.decode(token) as any;
  const expiresIn = decoded.exp - Math.floor(Date.now() / MILLISECONDS_IN_SECOND);

  await this.blacklistService.blacklist(token, expiresIn);

  return { message: ERROR_MESSAGES.LOGOUT_SUCCESS };
}
}