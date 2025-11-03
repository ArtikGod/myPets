import { Injectable, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../../shared/entities/booking.entity';
import { Restaurant } from '../../../shared/entities/restaurant.entity';
import { CreateBookingDto } from '../../../shared/dto/create-booking.dto';
import { BookingResponseDto } from '../../../shared/dto/booking-response.dto';
import { BookingStatus } from '../../../shared/interfaces/booking-status.enum';
import { BookingCreatedEvent } from '../../../shared/interfaces/booking.interface';
import { KafkaService } from '../kafka/kafka.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private readonly kafkaService: KafkaService,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<BookingResponseDto> {
    this.logger.log(`Creating booking for restaurant ${createBookingDto.restaurantId}`);

    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id: createBookingDto.restaurantId },
      });

      if (!restaurant) {
        throw new NotFoundException(`Ресторан с ID ${createBookingDto.restaurantId} не найден`);
      }

      const booking = this.bookingRepository.create({
        ...createBookingDto,
        status: BookingStatus.CREATED,
      });

      const savedBooking = await this.bookingRepository.save(booking);
      this.logger.log(`Booking created with ID: ${savedBooking.id}`);

      const event: BookingCreatedEvent = {
        booking: {
          id: savedBooking.id,
          restaurantId: savedBooking.restaurantId,
          bookingDate: savedBooking.bookingDate,
          bookingTime: savedBooking.bookingTime,
          guestCount: savedBooking.guestCount,
          status: savedBooking.status,
          createdAt: savedBooking.createdAt,
          updatedAt: savedBooking.updatedAt,
        },
        timestamp: new Date(),
      };

      try {
        await this.kafkaService.publishBookingCreated(event);
      } catch (kafkaError) {
        this.logger.error(`Failed to publish Kafka event: ${kafkaError.message}`, kafkaError.stack);
        
        await this.bookingRepository.delete(savedBooking.id);
        this.logger.log(`Booking ${savedBooking.id} deleted due to Kafka failure`);
        
        throw new InternalServerErrorException('Не удалось создать бронирование - сервис временно недоступен');
      }

      return this.mapToResponseDto(savedBooking);
    } catch (error) {
      this.logger.error(`Failed to create booking: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException || error instanceof InternalServerErrorException) {
        throw error;
      }
      
      throw new InternalServerErrorException('Не удалось создать бронирование');
    }
  }

  async getBookingById(id: number): Promise<BookingResponseDto> {
    this.logger.log(`Getting booking with ID: ${id}`);

    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['restaurant'],
    });

    if (!booking) {
      throw new NotFoundException(`Бронирование с ID ${id} не найдено`);
    }

    return this.mapToResponseDto(booking);
  }

  async getAllBookings(): Promise<BookingResponseDto[]> {
    this.logger.log('Getting all bookings');

    const bookings = await this.bookingRepository.find({
      relations: ['restaurant'],
      order: { createdAt: 'DESC' },
    });

    return bookings.map(booking => this.mapToResponseDto(booking));
  }

  async updateBookingStatus(id: number, status: BookingStatus): Promise<BookingResponseDto> {
    this.logger.log(`Updating booking ${id} status to ${status}`);

    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Бронирование с ID ${id} не найдено`);
    }

    booking.status = status;
    const updatedBooking = await this.bookingRepository.save(booking);

    this.logger.log(`Booking ${id} status updated to ${status}`);
    return this.mapToResponseDto(updatedBooking);
  }

  private mapToResponseDto(booking: Booking): BookingResponseDto {
    return {
      id: booking.id,
      restaurantId: booking.restaurantId,
      bookingDate: booking.bookingDate,
      bookingTime: booking.bookingTime,
      guestCount: booking.guestCount,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}