import request from 'supertest';
import { AppDataSource } from '../config/database';
import app from '../app';
import { Appeal } from '../entities/entity';

describe('Appeals API', () => {
  let createdAppealId: number;
  const testAppeal = {
    topic: 'Test Topic',
    description: 'Test Description'
  };

  beforeAll(async () => {
    await AppDataSource.initialize();
    await AppDataSource.getRepository(Appeal).clear();
  });

  afterAll(async () => {
    await AppDataSource.destroy();
  });

  describe('POST /appeals', () => {
    it('should create a new appeal', async () => {
      const response = await request(app)
        .post('/appeals')
        .send(testAppeal)
        .expect(201);

      expect(response.body.message).toBe('Appeal created successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.topic).toBe(testAppeal.topic);
      
      createdAppealId = response.body.data.id;
    });

    it('should return 400 for invalid data', async () => {
      await request(app)
        .post('/appeals')
        .send({})
        .expect(400);
    });
  });

  describe('PUT /appeals/:id/take-in-work', () => {
    it('should update status to InProgress', async () => {
      const response = await request(app)
        .put(`/appeals/${createdAppealId}/take-in-work`)
        .expect(200);

      expect(response.body.message).toBe('Status updated successfully');
      expect(response.body.data.status).toBe('InProgress');
    });

    it('should return 404 for non-existent appeal', async () => {
      await request(app)
        .put('/appeals/999999/take-in-work')
        .expect(404);
    });
  });

  describe('PUT /appeals/:id/complete', () => {
    it('should complete the appeal', async () => {
      const response = await request(app)
        .put(`/appeals/${createdAppealId}/complete`)
        .send({ resolutionText: 'Test resolution' })
        .expect(200);

      expect(response.body.message).toBe('Status updated successfully');
      expect(response.body.data.status).toBe('Completed');
      expect(response.body.data.resolutionText).toBe('Test resolution');
    });
  });

  describe('PUT /appeals/:id/cancel', () => {
    it('should cancel the appeal', async () => {
      const newAppeal = await request(app)
        .post('/appeals')
        .send(testAppeal);

      const response = await request(app)
        .put(`/appeals/${newAppeal.body.data.id}/cancel`)
        .send({ cancellationReason: 'Test cancellation' })
        .expect(200);

      expect(response.body.message).toBe('Status updated successfully');
      expect(response.body.data.status).toBe('Canceled');
      expect(response.body.data.cancellationReason).toBe('Test cancellation');
    });
  });

  describe('GET /appeals', () => {
    it('should get all appeals', async () => {
      const response = await request(app)
        .get('/appeals')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by date range', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 1000 * 60 * 5); 
      const future = new Date(now.getTime() + 1000 * 60 * 5); 

      const response = await request(app)
        .get('/appeals')
        .query({
          startDate: past.toISOString(),
          endDate: future.toISOString()
        })
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /appeals/cancel-all-in-progress', () => {
    it('should cancel all in-progress appeals', async () => {
      const newAppeal = await request(app)
        .post('/appeals')
        .send(testAppeal);

      await request(app)
        .put(`/appeals/${newAppeal.body.data.id}/take-in-work`)
        .expect(200);

      const response = await request(app)
        .post('/appeals/cancel-all-in-progress')
        .send({ cancellationReason: 'Mass cancellation' })
        .expect(200);

      expect(response.body.message).toBe('All in-progress appeals canceled');

      const checkResponse = await request(app)
        .get(`/appeals/${newAppeal.body.data.id}`)
        .expect(200);

      expect(checkResponse.body.data.status).toBe('Canceled');
    });
  });
});

