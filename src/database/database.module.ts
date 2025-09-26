import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { File } from '../files/entities/file.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';
import { DATABASE_CONSTANTS } from './constants/database.constants';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dialect: DATABASE_CONSTANTS.DIALECT,
        host: configService.get(DATABASE_CONSTANTS.ENV.HOST),
        port: +configService.get(DATABASE_CONSTANTS.ENV.PORT),
        username: configService.get(DATABASE_CONSTANTS.ENV.USERNAME),
        password: configService.get(DATABASE_CONSTANTS.ENV.PASSWORD),
        database: configService.get(DATABASE_CONSTANTS.ENV.NAME),
        models: [User, File, RefreshToken],
        autoLoadModels: DATABASE_CONSTANTS.OPTIONS.AUTOLOAD_MODELS,
        synchronize: DATABASE_CONSTANTS.OPTIONS.SYNCHRONIZE,
        logging: configService.get(DATABASE_CONSTANTS.ENV.NODE_ENV) === DATABASE_CONSTANTS.NODE_ENV.DEVELOPMENT ? console.log : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}