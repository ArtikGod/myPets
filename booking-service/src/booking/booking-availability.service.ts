import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, DataSource } from 'typeorm';
import { Booking } from '../../../shared/entities/booking.entity';
import { BookingStatus } from '../../../shared/interfaces/booking-status.enum';
import { BookingCreatedEvent } from '../../../shared/interfaces/booking.interface';

@Injectable()
export class BookingAvailabilityService {
  private readonly logger = new Logger(BookingAvailabilityService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly dataSource: DataSource,
  ) {}

  async handleBookingCreated(data: any): Promise<void> {
    try {
      const eventData: BookingCreatedEvent = typeof data.value === 'string' 
        ? JSON.parse(data.value) 
        : data.value || data;

      this.logger.log(`Получено событие создания бронирования: ${eventData.booking.id}`);

      await this.updateBookingStatus(eventData.booking.id, BookingStatus.CHECKING_AVAILABILITY);

      const isAvailable = await this.checkAvailability(eventData.booking);

      if (!isAvailable) {
        await this.rejectBooking(eventData.booking.id);
        this.logger.log(`Бронирование ${eventData.booking.id} отклонено - нет свободных столиков`);
      } else {
        this.logger.log(`Бронирование ${eventData.booking.id} подтверждено`);
      }

    } catch (error) {
      this.logger.error(`Ошибка обработки события создания бронирования: ${error.message}`, error.stack);
      
      try {
        if (data.booking?.id) {
          await this.rejectBooking(data.booking.id);
        }
      } catch (rejectError) {
        this.logger.error(`Не удалось отклонить бронирование после ошибки: ${rejectError.message}`);
      }
    }
  }

  async checkAvailability(booking: any): Promise<boolean> {
    try {
      this.logger.log(`Проверка доступности для ресторана ${booking.restaurantId} на ${booking.bookingDate} в ${booking.bookingTime}`);

      return await this.dataSource.transaction(async manager => {
        const whereCondition: any = {
          restaurantId: booking.restaurantId,
          bookingDate: booking.bookingDate,
          bookingTime: booking.bookingTime,
          status: In([
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKING_AVAILABILITY,
          ]),
        };

        if (booking.id) {
          whereCondition.id = Not(booking.id);
        }

        const existingBookings = await manager.find(Booking, {
          where: whereCondition,
          lock: { mode: 'pessimistic_write' }
        });

        const isAvailable = existingBookings.length === 0;
        
        this.logger.log(`Результат проверки доступности: ${isAvailable ? 'доступно' : 'занято'} (найдено ${existingBookings.length} конфликтующих бронирований)`);
        
        if (isAvailable && booking.id) {
          await manager.update(Booking, booking.id, {
            status: BookingStatus.CONFIRMED
          });
        }
        
        return isAvailable;
      });

    } catch (error) {
      this.logger.error(`Ошибка при проверке доступности: ${error.message}`, error.stack);
      return false;
    }
  }

  private async updateBookingStatus(bookingId: number, status: BookingStatus): Promise<void> {
    try {
      await this.bookingRepository.update(bookingId, { status });
      this.logger.log(`Статус бронирования ${bookingId} обновлен на ${status}`);
    } catch (error) {
      this.logger.error(`Ошибка обновления статуса бронирования ${bookingId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async confirmBooking(bookingId: number): Promise<void> {
    await this.updateBookingStatus(bookingId, BookingStatus.CONFIRMED);
  }

  private async rejectBooking(bookingId: number): Promise<void> {
    await this.updateBookingStatus(bookingId, BookingStatus.REJECTED);
  }
}