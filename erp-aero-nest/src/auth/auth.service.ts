import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES, HASH_DIFFICULTY } from '../shared/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignUpDto) {
    const existing = await this.usersService.findById(dto.id);
    if (existing) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    const hashedPassword = await bcrypt.hash(dto.password, HASH_DIFFICULTY);
    const user = await this.usersService.create({
      id: dto.id,
      password: hashedPassword,
    });

    return this.generateTokens(user.id);
  }

  async signin(dto: SignInDto) {
    const user = await this.usersService.findById(dto.id);
    if (!user) throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);

    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException(ERROR_MESSAGES.UNAUTHORIZED);

    return this.generateTokens(user.id);
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      return this.generateTokens(payload.sub);
    } catch (e) {
      throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  private generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRATION,
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRATION,
      },
    );

    return { accessToken, refreshToken };
  }
}
