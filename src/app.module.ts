import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PaymentHistoryModule } from './payment-history/payment-history.module';
import { BalanceModule } from './balance/balance.module';
import { User } from './users/entities/user.entity';
import { PaymentHistory } from './payment-history/entities/payment-history.entity';
import { APP_CONSTANTS } from './common/constants/app.constants';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: APP_CONSTANTS.CONFIG.IS_GLOBAL,
    }),
    TypeOrmModule.forRoot({
      type: APP_CONSTANTS.DATABASE.TYPE_POSTGRES,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, PaymentHistory],
      synchronize:
        process.env.NODE_ENV !== APP_CONSTANTS.ENVIRONMENT.PRODUCTION,
      logging: process.env.NODE_ENV === APP_CONSTANTS.ENVIRONMENT.DEVELOPMENT,
    }),
    CacheModule.register({
      isGlobal: APP_CONSTANTS.CONFIG.IS_GLOBAL,
      ttl: APP_CONSTANTS.CACHE_TTL,
    }),
    UsersModule,
    PaymentHistoryModule,
    BalanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
