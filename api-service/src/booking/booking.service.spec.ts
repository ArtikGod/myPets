import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { BookingService } from './booking.service';
import { Booking } from '../../../shared/entities/booking.entity';
import { Restaurant } from '../../../shared/entities/restaurant.entity';
import { BookingStatus } from '../../../shared/interfaces/booking-status.enum';
import { KafkaService } from '../kafka/kafka.service';

describe('BookingService', () => {
  let service: BookingService;
  let bookingRepository: Repository<Booking>;
  let restaurantRepository: Repository<Restaurant>;
  let kafkaService: KafkaService;

  const mockBookingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockRestaurantRepository = {
    findOne: jest.fn(),
  };

  const mockKafkaService = {
    publishBookingCreated: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(Restaurant),
          useValue: mockRestaurantRepository,
        },
        {
          provide: KafkaService,
          useValue: mockKafkaService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
    restaurantRepository = module.get<Repository<Restaurant>>(getRepositoryToken(Restaurant));
    kafkaService = module.get<KafkaService>(KafkaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const createBookingDto = {
      restaurantId: 1,
      bookingDate: '2024-01-15',
      bookingTime: '19:30',
      guestCount: 4,
    };

    const mockRestaurant = {
      id: 1,
      name: 'Test Restaurant',
      createdAt: new Date(),
    };

    const mockBooking = {
      id: 1,
      ...createBookingDto,
      status: BookingStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a booking successfully', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);
      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(mockBooking);
      mockKafkaService.publishBookingCreated.mockResolvedValue(undefined);

      const result = await service.createBooking(createBookingDto);

      expect(mockRestaurantRepository.findOne).toHaveBeenCalledWith({
        where: { id: createBookingDto.restaurantId },
      });
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...createBookingDto,
        status: BookingStatus.CREATED,
      });
      expect(mockBookingRepository.save).toHaveBeenCalledWith(mockBooking);
      expect(mockKafkaService.publishBookingCreated).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockBooking.id,
        restaurantId: mockBooking.restaurantId,
        bookingDate: mockBooking.bookingDate,
        bookingTime: mockBooking.bookingTime,
        guestCount: mockBooking.guestCount,
        status: mockBooking.status,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
      });
    });

    it('should throw NotFoundException when restaurant does not exist', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(null);

      await expect(service.createBooking(createBookingDto)).rejects.toThrow(
        new NotFoundException(`Ресторан с ID ${createBookingDto.restaurantId} не найден`),
      );

      expect(mockBookingRepository.create).not.toHaveBeenCalled();
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
      expect(mockKafkaService.publishBookingCreated).not.toHaveBeenCalled();
    });
  });

  describe('getBookingById', () => {
    const bookingId = 1;
    const mockBooking = {
      id: bookingId,
      restaurantId: 1,
      bookingDate: '2024-01-15',
      bookingTime: '19:30',
      guestCount: 4,
      status: BookingStatus.CONFIRMED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should return booking when found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);

      const result = await service.getBookingById(bookingId);

      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookingId },
        relations: ['restaurant'],
      });
      expect(result).toEqual({
        id: mockBooking.id,
        restaurantId: mockBooking.restaurantId,
        bookingDate: mockBooking.bookingDate,
        bookingTime: mockBooking.bookingTime,
        guestCount: mockBooking.guestCount,
        status: mockBooking.status,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
      });
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.getBookingById(bookingId)).rejects.toThrow(
        new NotFoundException(`Бронирование с ID ${bookingId} не найдено`),
      );
    });
  });

  describe('getAllBookings', () => {
    const mockBookings = [
      {
        id: 1,
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
        status: BookingStatus.CONFIRMED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        restaurantId: 2,
        bookingDate: '2024-01-16',
        bookingTime: '20:00',
        guestCount: 2,
        status: BookingStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return all bookings', async () => {
      mockBookingRepository.find.mockResolvedValue(mockBookings);

      const result = await service.getAllBookings();

      expect(mockBookingRepository.find).toHaveBeenCalledWith({
        relations: ['restaurant'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(mockBookings[0].id);
      expect(result[1].id).toBe(mockBookings[1].id);
    });

    it('should return empty array when no bookings found', async () => {
      mockBookingRepository.find.mockResolvedValue([]);

      const result = await service.getAllBookings();

      expect(result).toEqual([]);
    });
  });

  describe('updateBookingStatus', () => {
    const bookingId = 1;
    const mockBooking = {
      id: bookingId,
      restaurantId: 1,
      bookingDate: '2024-01-15',
      bookingTime: '19:30',
      guestCount: 4,
      status: BookingStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update booking status successfully', async () => {
      const updatedBooking = { ...mockBooking, status: BookingStatus.CONFIRMED };
      
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(updatedBooking);

      const result = await service.updateBookingStatus(bookingId, BookingStatus.CONFIRMED);

      expect(mockBookingRepository.findOne).toHaveBeenCalledWith({
        where: { id: bookingId },
      });
      expect(mockBookingRepository.save).toHaveBeenCalledWith({
        ...mockBooking,
        status: BookingStatus.CONFIRMED,
      });
      expect(result).toEqual({
        id: updatedBooking.id,
        restaurantId: updatedBooking.restaurantId,
        bookingDate: updatedBooking.bookingDate,
        bookingTime: updatedBooking.bookingTime,
        guestCount: updatedBooking.guestCount,
        status: updatedBooking.status,
        createdAt: updatedBooking.createdAt,
        updatedAt: updatedBooking.updatedAt,
      });
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);

      await expect(service.updateBookingStatus(bookingId, BookingStatus.CONFIRMED)).rejects.toThrow(
        new NotFoundException(`Бронирование с ID ${bookingId} не найдено`),
      );

      expect(mockBookingRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Database Error Handling', () => {
    const createBookingDto = {
      restaurantId: 1,
      bookingDate: '2024-01-15',
      bookingTime: '19:30',
      guestCount: 4,
    };

    const mockRestaurant = {
      id: 1,
      name: 'Test Restaurant',
      createdAt: new Date(),
    };

    it('should handle database error during restaurant lookup', async () => {
      mockRestaurantRepository.findOne.mockRejectedValue(new Error('Database connection failed'));

      await expect(service.createBooking(createBookingDto)).rejects.toThrow('Не удалось создать бронирование');

      expect(mockBookingRepository.create).not.toHaveBeenCalled();
      expect(mockBookingRepository.save).not.toHaveBeenCalled();
      expect(mockKafkaService.publishBookingCreated).not.toHaveBeenCalled();
    });

    it('should handle database error during booking save', async () => {
      const mockBooking = {
        id: 1,
        ...createBookingDto,
        status: BookingStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);
      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockRejectedValue(new Error('Database save failed'));

      await expect(service.createBooking(createBookingDto)).rejects.toThrow('Не удалось создать бронирование');

      expect(mockKafkaService.publishBookingCreated).not.toHaveBeenCalled();
    });

    it('should handle database error during booking retrieval in getBookingById', async () => {
      mockBookingRepository.findOne.mockRejectedValue(new Error('Database query failed'));

      await expect(service.getBookingById(1)).rejects.toThrow('Database query failed');
    });

    it('should handle database error during getAllBookings', async () => {
      mockBookingRepository.find.mockRejectedValue(new Error('Database query failed'));

      await expect(service.getAllBookings()).rejects.toThrow('Database query failed');
    });

    it('should handle database error during updateBookingStatus', async () => {
      mockBookingRepository.findOne.mockRejectedValue(new Error('Database query failed'));

      await expect(service.updateBookingStatus(1, BookingStatus.CONFIRMED)).rejects.toThrow('Database query failed');
    });

    it('should handle database error during booking update save', async () => {
      const mockBooking = {
        id: 1,
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
        status: BookingStatus.CREATED,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockRejectedValue(new Error('Database update failed'));

      await expect(service.updateBookingStatus(1, BookingStatus.CONFIRMED)).rejects.toThrow('Database update failed');
    });
  });

  describe('Kafka Error Handling', () => {
    const createBookingDto = {
      restaurantId: 1,
      bookingDate: '2024-01-15',
      bookingTime: '19:30',
      guestCount: 4,
    };

    const mockRestaurant = {
      id: 1,
      name: 'Test Restaurant',
      createdAt: new Date(),
    };

    const mockBooking = {
      id: 1,
      ...createBookingDto,
      status: BookingStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should handle Kafka publish error but still return booking', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);
      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(mockBooking);
      mockKafkaService.publishBookingCreated.mockRejectedValue(new Error('Kafka publish failed'));

      await expect(service.createBooking(createBookingDto)).rejects.toThrow('Не удалось создать бронирование');

      expect(mockBookingRepository.save).toHaveBeenCalled();
    });

    it('should create booking successfully even if Kafka is slow', async () => {
      mockRestaurantRepository.findOne.mockResolvedValue(mockRestaurant);
      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(mockBooking);
      mockKafkaService.publishBookingCreated.mockImplementation(() =>
        new Promise(resolve => setTimeout(resolve, 100))
      );

      const result = await service.createBooking(createBookingDto);

      expect(result).toEqual({
        id: mockBooking.id,
        restaurantId: mockBooking.restaurantId,
        bookingDate: mockBooking.bookingDate,
        bookingTime: mockBooking.bookingTime,
        guestCount: mockBooking.guestCount,
        status: mockBooking.status,
        createdAt: mockBooking.createdAt,
        updatedAt: mockBooking.updatedAt,
      });
    });
  });
});