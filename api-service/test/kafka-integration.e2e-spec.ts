import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { BookingStatus } from '../../shared/interfaces/booking-status.enum';

describe('Kafka Integration (e2e)', () => {
  let app: INestApplication;
  let kafkaClient: ClientKafka;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    kafkaClient = app.get('KAFKA_SERVICE');
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Booking creation with Kafka events', () => {
    it('should publish Kafka event when booking is created', async () => {
      const kafkaEmitSpy = jest.spyOn(kafkaClient, 'emit');
      
      const bookingData = {
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      expect(response.body.status).toBe(BookingStatus.CREATED);
      
      expect(kafkaEmitSpy).toHaveBeenCalledWith('booking.created', expect.objectContaining({
        value: expect.stringContaining('"id":' + response.body.id)
      }));
    });

    it('should handle multiple concurrent bookings', async () => {
      const kafkaEmitSpy = jest.spyOn(kafkaClient, 'emit');
      
      const bookingData = {
        restaurantId: 1,
        bookingDate: '2024-01-16',
        bookingTime: '20:00',
        guestCount: 2,
      };

      const promises = Array.from({ length: 2 }, () =>
        request(app.getHttpServer())
          .post('/bookings')
          .send({
            ...bookingData,
            bookingTime: Math.random() > 0.5 ? '20:00' : '21:00', 
          })
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      expect(kafkaEmitSpy).toHaveBeenCalledTimes(2);
    });

    it('should create multiple bookings and publish events', async () => {
      const kafkaEmitSpy = jest.spyOn(kafkaClient, 'emit');
      
      const bookings = [
        {
          restaurantId: 1,
          bookingDate: '2024-01-17',
          bookingTime: '18:00',
          guestCount: 2,
        },
        {
          restaurantId: 2,
          bookingDate: '2024-01-17',
          bookingTime: '19:00',
          guestCount: 4,
        },
        {
          restaurantId: 1,
          bookingDate: '2024-01-17',
          bookingTime: '20:00',
          guestCount: 6,
        },
      ];

      const responses = [];
      for (const booking of bookings) {
        const response = await request(app.getHttpServer())
          .post('/bookings')
          .send(booking)
          .expect(201);
        responses.push(response);
      }

      expect(kafkaEmitSpy).toHaveBeenCalledTimes(3);
      
      responses.forEach((response, index) => {
        expect(response.body.status).toBe(BookingStatus.CREATED);
        expect(response.body.restaurantId).toBe(bookings[index].restaurantId);
      });
    });
  });

  describe('Kafka event structure validation', () => {
    it('should publish event with correct structure', async () => {
      const kafkaEmitSpy = jest.spyOn(kafkaClient, 'emit');
      
      const bookingData = {
        restaurantId: 1,
        bookingDate: '2024-01-18',
        bookingTime: '19:30',
        guestCount: 4,
      };

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      expect(kafkaEmitSpy).toHaveBeenCalledWith('booking.created', expect.objectContaining({
        value: expect.any(String)
      }));

      const eventCall = kafkaEmitSpy.mock.calls[0];
      const eventData = JSON.parse((eventCall[1] as any).value);
      
      expect(eventData).toHaveProperty('booking');
      expect(eventData).toHaveProperty('timestamp');
      expect(eventData.booking).toHaveProperty('id', response.body.id);
      expect(eventData.booking).toHaveProperty('restaurantId', bookingData.restaurantId);
      expect(eventData.booking).toHaveProperty('status', BookingStatus.CREATED);
    });
  });

  describe('Error scenarios', () => {
    it('should not publish event for invalid booking data', async () => {
      const kafkaEmitSpy = jest.spyOn(kafkaClient, 'emit');
      
      const invalidBookingData = {
        restaurantId: 999, 
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .send(invalidBookingData)
        .expect(404);

      expect(kafkaEmitSpy).not.toHaveBeenCalled();
    });

    it('should handle malformed booking data', async () => {
      const kafkaEmitSpy = jest.spyOn(kafkaClient, 'emit');
      
      const malformedData = {
        restaurantId: 'invalid',
        bookingDate: 'invalid-date',
        guestCount: -1,
      };

      await request(app.getHttpServer())
        .post('/bookings')
        .send(malformedData)
        .expect(400);

      expect(kafkaEmitSpy).not.toHaveBeenCalled();
    });
  });
});