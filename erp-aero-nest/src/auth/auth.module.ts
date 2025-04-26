import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { User } from '../users/entities/users.entity';
import { BlacklistService } from './blacklist.service';
import { BlacklistedToken } from './entities/blacklisted-token.entity';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}), 
    TypeOrmModule.forFeature([User, BlacklistedToken]),
  ],
  providers: [AuthService, JwtStrategy, BlacklistService],
  controllers: [AuthController],
})
export class AuthModule {}
