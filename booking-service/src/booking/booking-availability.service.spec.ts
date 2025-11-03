import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In, Not } from 'typeorm';
import { BookingAvailabilityService } from './booking-availability.service';
import { Booking } from '../../../shared/entities/booking.entity';
import { BookingStatus } from '../../../shared/interfaces/booking-status.enum';
import { BookingCreatedEvent } from '../../../shared/interfaces/booking.interface';

describe('BookingAvailabilityService', () => {
  let service: BookingAvailabilityService;
  let bookingRepository: Repository<Booking>;

  const mockBookingRepository = {
    find: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingAvailabilityService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
      ],
    }).compile();

    service = module.get<BookingAvailabilityService>(BookingAvailabilityService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleBookingCreated', () => {
    const mockEvent: BookingCreatedEvent = {
      booking: {
        id: 1,
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
        status: BookingStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      timestamp: new Date(),
    };

    it('should confirm booking when available', async () => {
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });
      mockBookingRepository.find.mockResolvedValue([]);

      await service.handleBookingCreated({ value: JSON.stringify(mockEvent) });

      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.CHECKING_AVAILABILITY,
      });
      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.CONFIRMED,
      });
    });

    it('should reject booking when not available', async () => {
      const conflictingBooking = {
        id: 2,
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        status: BookingStatus.CONFIRMED,
      };

      mockBookingRepository.update.mockResolvedValue({ affected: 1 });
      mockBookingRepository.find.mockResolvedValue([conflictingBooking]);

      await service.handleBookingCreated({ value: JSON.stringify(mockEvent) });

      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.CHECKING_AVAILABILITY,
      });
      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.REJECTED,
      });
    });

    it('should handle event data as object', async () => {
      mockBookingRepository.update.mockResolvedValue({ affected: 1 });
      mockBookingRepository.find.mockResolvedValue([]);

      await service.handleBookingCreated({ value: mockEvent });

      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.CHECKING_AVAILABILITY,
      });
    });

    it('should reject booking on error', async () => {
      mockBookingRepository.update
        .mockResolvedValueOnce({ affected: 1 }) 
        .mockRejectedValueOnce(new Error('Database error')) 
        .mockResolvedValueOnce({ affected: 1 }); 

      mockBookingRepository.find.mockRejectedValue(new Error('Database error'));

      await service.handleBookingCreated({ value: JSON.stringify(mockEvent) });

      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.CHECKING_AVAILABILITY,
      });
      expect(mockBookingRepository.update).toHaveBeenCalledWith(1, {
        status: BookingStatus.REJECTED,
      });
    });
  });

  describe('checkAvailability', () => {
    const mockBooking = {
      id: 1,
      restaurantId: 1,
      bookingDate: '2024-01-15',
      bookingTime: '19:30',
      guestCount: 4,
    };

    it('should return true when no conflicting bookings exist', async () => {
      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.checkAvailability(mockBooking);

      expect(result).toBe(true);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: {
          restaurantId: mockBooking.restaurantId,
          bookingDate: mockBooking.bookingDate,
          bookingTime: mockBooking.bookingTime,
          status: In([BookingStatus.CONFIRMED, BookingStatus.CHECKING_AVAILABILITY]),
          id: Not(mockBooking.id),
        },
      });
    });

    it('should return false when conflicting bookings exist', async () => {
      const conflictingBooking = {
        id: 2,
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        status: BookingStatus.CONFIRMED,
      };

      mockBookingRepository.find.mockResolvedValue([conflictingBooking]);

      const result = await service.checkAvailability(mockBooking);

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      mockBookingRepository.find.mockRejectedValue(new Error('Database error'));

      const result = await service.checkAvailability(mockBooking);

      expect(result).toBe(false);
    });

    it('should handle booking without id', async () => {
      const bookingWithoutId = {
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
      };

      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.checkAvailability(bookingWithoutId);

      expect(result).toBe(true);
      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        where: {
          restaurantId: bookingWithoutId.restaurantId,
          bookingDate: bookingWithoutId.bookingDate,
          bookingTime: bookingWithoutId.bookingTime,
          status: In([BookingStatus.CONFIRMED, BookingStatus.CHECKING_AVAILABILITY]),
        },
      });
    });
  });
});