import { Test, TestingModule } from '@nestjs/testing';
import { ClientKafka } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { BookingCreatedEvent } from '../../../shared/interfaces/booking.interface';
import { BookingStatus } from '../../../shared/interfaces/booking-status.enum';

describe('KafkaService', () => {
  let service: KafkaService;
  let kafkaClient: ClientKafka;

  const mockKafkaClient = {
    emit: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KafkaService,
        {
          provide: 'KAFKA_SERVICE',
          useValue: mockKafkaClient,
        },
      ],
    }).compile();

    service = module.get<KafkaService>(KafkaService);
    kafkaClient = module.get<ClientKafka>('KAFKA_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to Kafka on module init', async () => {
      mockKafkaClient.connect.mockResolvedValue(undefined);

      await service.onModuleInit();

      expect(mockKafkaClient.connect).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should close Kafka connection on module destroy', async () => {
      mockKafkaClient.close.mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(mockKafkaClient.close).toHaveBeenCalled();
    });
  });

  describe('publishBookingCreated', () => {
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

    it('should publish booking created event successfully', async () => {
      mockKafkaClient.emit.mockResolvedValue(undefined);

      await service.publishBookingCreated(mockEvent);

      expect(mockKafkaClient.emit).toHaveBeenCalledWith('booking.created', {
        value: JSON.stringify(mockEvent),
      });
    });

    it('should handle publish error', async () => {
      mockKafkaClient.emit.mockRejectedValue(new Error('Publish failed'));

      await expect(service.publishBookingCreated(mockEvent)).rejects.toThrow('Publish failed');

      expect(mockKafkaClient.emit).toHaveBeenCalledWith('booking.created', {
        value: JSON.stringify(mockEvent),
      });
    });
  });
});