import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';

import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponse,
  TokenResponse,
  JwtPayload,
} from '../common/interfaces/auth.interface';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,
    @InjectModel(RefreshToken) private refreshTokenModel: typeof RefreshToken,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(AUTH_CONSTANTS.MESSAGES.USER_ALREADY_EXISTS);
    }

    try {
      const user = await this.userModel.create(registerDto);

      const tokens = await this.generateTokens(user);

      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return {
        user: this.sanitizeUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new InternalServerErrorException(AUTH_CONSTANTS.ERRORS.INTERNAL_ERROR);
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.INVALID_CREDENTIALS);
    }

    const tokens = await this.generateTokens(user);

    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get(AUTH_CONSTANTS.JWT.REFRESH_SECRET_ENV),
      });

      const storedToken = await this.refreshTokenModel.findOne({
        where: {
          token: refreshToken,
          userId: payload.sub,
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      if (!storedToken) {
        throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.INVALID_TOKEN);
      }

      const user = await this.userModel.findByPk(payload.sub);
      if (!user) {
        throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.USER_NOT_FOUND);
      }

      const tokens = await this.generateTokens(user);

      await storedToken.destroy();
      await this.saveRefreshToken(user.id, tokens.refreshToken);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.INVALID_TOKEN);
    }
  }

  async logout(userId: number, refreshToken: string): Promise<void> {
    await this.refreshTokenModel.destroy({
      where: {
        userId,
        token: refreshToken,
      },
    });
  }

  private async generateTokens(user: User): Promise<TokenResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get(AUTH_CONSTANTS.JWT.ACCESS_SECRET_ENV),
        expiresIn: this.configService.get(AUTH_CONSTANTS.JWT.ACCESS_EXPIRES_IN_ENV, AUTH_CONSTANTS.JWT.DEFAULT_EXPIRES_IN),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get(AUTH_CONSTANTS.JWT.REFRESH_SECRET_ENV),
        expiresIn: this.configService.get(AUTH_CONSTANTS.JWT.REFRESH_EXPIRES_IN_ENV, AUTH_CONSTANTS.JWT.DEFAULT_REFRESH_EXPIRES_IN),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: AUTH_CONSTANTS.JWT.ACCESS_TOKEN_EXPIRES_IN,
    };
  }

  private async saveRefreshToken(userId: number, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + AUTH_CONSTANTS.JWT.REFRESH_TOKEN_EXPIRES_DAYS);

    await this.refreshTokenModel.create({
      userId,
      token,
      expiresAt,
    });
  }

  private sanitizeUser(user: User): Partial<User> {
    const userJson = user.toJSON();
    delete userJson.password;
    return userJson;
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.userModel.findByPk(payload.sub);
    if (!user) {
      throw new UnauthorizedException(AUTH_CONSTANTS.MESSAGES.USER_NOT_FOUND);
    }
    return user;
  }
}