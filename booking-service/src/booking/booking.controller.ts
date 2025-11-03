import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingAvailabilityService } from './booking-availability.service';

@Controller()
export class BookingController {
  constructor(
    private readonly bookingAvailabilityService: BookingAvailabilityService,
  ) {}

  @MessagePattern('booking.created')
  async handleBookingCreated(@Payload() data: any): Promise<void> {
    return this.bookingAvailabilityService.handleBookingCreated(data);
  }
}