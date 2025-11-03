import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { BookingStatus } from '../../shared/interfaces/booking-status.enum';

describe('Booking Availability (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Table availability conflicts', () => {
    it('should handle conflicting bookings for same time slot', async () => {
      const bookingData = {
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
      };

      const firstBooking = await request(app.getHttpServer())
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      expect(firstBooking.body.status).toBe(BookingStatus.CREATED);

      const secondBooking = await request(app.getHttpServer())
        .post('/bookings')
        .send(bookingData)
        .expect(201);

      expect(secondBooking.body.status).toBe(BookingStatus.CREATED);

      expect(firstBooking.body.id).not.toBe(secondBooking.body.id);
    });

    it('should allow bookings for different time slots', async () => {
      const baseBookingData = {
        restaurantId: 1,
        bookingDate: '2024-01-15',
        guestCount: 2,
      };

      const booking1 = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          ...baseBookingData,
          bookingTime: '19:00',
        })
        .expect(201);

      const booking2 = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          ...baseBookingData,
          bookingTime: '20:00',
        })
        .expect(201);

      expect(booking1.body.status).toBe(BookingStatus.CREATED);
      expect(booking2.body.status).toBe(BookingStatus.CREATED);
      expect(booking1.body.id).not.toBe(booking2.body.id);
    });

    it('should allow bookings for different restaurants at same time', async () => {
      const bookingData = {
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
      };

      const booking1 = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          ...bookingData,
          restaurantId: 1,
        })
        .expect(201);

      const booking2 = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          ...bookingData,
          restaurantId: 2,
        })
        .expect(201);

      expect(booking1.body.status).toBe(BookingStatus.CREATED);
      expect(booking2.body.status).toBe(BookingStatus.CREATED);
      expect(booking1.body.restaurantId).toBe(1);
      expect(booking2.body.restaurantId).toBe(2);
    });

    it('should allow bookings for different dates at same time', async () => {
      const bookingData = {
        restaurantId: 1,
        bookingTime: '19:30',
        guestCount: 4,
      };

      const booking1 = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          ...bookingData,
          bookingDate: '2024-01-15',
        })
        .expect(201);

      const booking2 = await request(app.getHttpServer())
        .post('/bookings')
        .send({
          ...bookingData,
          bookingDate: '2024-01-16',
        })
        .expect(201);

      expect(booking1.body.status).toBe(BookingStatus.CREATED);
      expect(booking2.body.status).toBe(BookingStatus.CREATED);
      expect(booking1.body.bookingDate).toBe('2024-01-15');
      expect(booking2.body.bookingDate).toBe('2024-01-16');
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid bookings for same slot', async () => {
      const bookingData = {
        restaurantId: 1,
        bookingDate: '2024-01-20',
        bookingTime: '18:00',
        guestCount: 2,
      };

      const promises = Array.from({ length: 3 }, () =>
        request(app.getHttpServer())
          .post('/bookings')
          .send(bookingData)
      );

      const results = await Promise.all(promises);

      results.forEach(result => {
        expect(result.status).toBe(201);
        expect(result.body.status).toBe(BookingStatus.CREATED);
      });

      const ids = results.map(r => r.body.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });

    it('should validate booking data before processing', async () => {
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
    });
  });
});