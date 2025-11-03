import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingAvailabilityService } from './booking-availability.service';
import { BookingController } from './booking.controller';
import { Booking } from '../../../shared/entities/booking.entity';
import { Restaurant } from '../../../shared/entities/restaurant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Restaurant]),
  ],
  controllers: [BookingController],
  providers: [BookingAvailabilityService],
  exports: [BookingAvailabilityService],
})
export class BookingModule {}