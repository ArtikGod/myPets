import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('BookingController (e2e)', () => {
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

  it('/bookings (POST) - should create a booking', () => {
    return request(app.getHttpServer())
      .post('/bookings')
      .send({
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '19:30',
        guestCount: 4,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('status', 'CREATED');
        expect(res.body.restaurantId).toBe(1);
        expect(res.body.guestCount).toBe(4);
      });
  });

  it('/bookings (GET) - should return all bookings', () => {
    return request(app.getHttpServer())
      .get('/bookings')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  it('/bookings/:id (GET) - should return a specific booking', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/bookings')
      .send({
        restaurantId: 1,
        bookingDate: '2024-01-15',
        bookingTime: '20:00',
        guestCount: 2,
      });

    const bookingId = createResponse.body.id;

    return request(app.getHttpServer())
      .get(`/bookings/${bookingId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.id).toBe(bookingId);
        expect(res.body.restaurantId).toBe(1);
        expect(res.body.guestCount).toBe(2);
      });
  });

  it('/bookings/:id (GET) - should return 404 for non-existent booking', () => {
    return request(app.getHttpServer())
      .get('/bookings/999999')
      .expect(404);
  });

  it('/bookings (POST) - should return 400 for invalid data', () => {
    return request(app.getHttpServer())
      .post('/bookings')
      .send({
        restaurantId: 'invalid',
        bookingDate: 'invalid-date',
        guestCount: -1,
      })
      .expect(400);
  });
});