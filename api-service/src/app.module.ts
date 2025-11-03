import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BookingModule } from './booking/booking.module';
import { DatabaseModule } from './database/database.module';
import { KafkaModule } from './kafka/kafka.module';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [databaseConfig],
    }),
    DatabaseModule,
    KafkaModule,
    BookingModule,
  ],
})
export class AppModule {}