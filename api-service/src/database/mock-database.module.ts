import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from '../../../shared/entities/booking.entity';
import { Restaurant } from '../../../shared/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      entities: [Booking, Restaurant],
      synchronize: true,
      logging: false,
    }),
    TypeOrmModule.forFeature([Booking, Restaurant]),
  ],
  exports: [TypeOrmModule],
})
export class MockDatabaseModule {}