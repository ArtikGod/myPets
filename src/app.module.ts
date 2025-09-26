import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AUTH_CONSTANTS } from './auth/constants/auth.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    DatabaseModule,

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>(AUTH_CONSTANTS.JWT.ACCESS_SECRET_ENV),
        signOptions: {
          expiresIn: configService.get<string>(AUTH_CONSTANTS.JWT.ACCESS_EXPIRES_IN_ENV, AUTH_CONSTANTS.JWT.DEFAULT_EXPIRES_IN),
        },
      }),
      inject: [ConfigService],
      global: true,
    }),

    PassportModule.register({ defaultStrategy: AUTH_CONSTANTS.JWT.DEFAULT_STRATEGY }),

    AuthModule,
    UsersModule,
    FilesModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}