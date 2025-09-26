import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { AUTH_CONSTANTS } from './constants/auth.constants';

@Module({
  imports: [
    SequelizeModule.forFeature([User, RefreshToken]),
    PassportModule.register({ defaultStrategy: AUTH_CONSTANTS.JWT.DEFAULT_STRATEGY }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(AUTH_CONSTANTS.JWT.ACCESS_SECRET_ENV),
        signOptions: {
          expiresIn: configService.get<string>(AUTH_CONSTANTS.JWT.ACCESS_EXPIRES_IN_ENV, AUTH_CONSTANTS.JWT.DEFAULT_EXPIRES_IN),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}