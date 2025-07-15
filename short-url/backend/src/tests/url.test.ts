import request from 'supertest';
import { AppDataSource } from '../config/db.js';
import app from '../app.js';

beforeAll(async () => {
  await AppDataSource.initialize();
});

afterAll(async () => {
  await AppDataSource.destroy();
});

describe('URL Shortener API', () => {
  const basePath = '/urls';

  it('should create a short URL', async () => {
    const response = await request(app)
      .post(`${basePath}/shorten`)
      .send({ originalUrl: 'https://example.com' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('URL shortened successfully');
    expect(response.body.data).toHaveProperty('shortUrl');
  });

  it('should not allow duplicate alias', async () => {
    const alias = 'test-alias';

    // Первый запрос с alias
    await request(app)
      .post(`${basePath}/shorten`)
      .send({ originalUrl: 'https://example.com/1', alias });

    // Повторный запрос с тем же alias
    const response = await request(app)
      .post(`${basePath}/shorten`)
      .send({ originalUrl: 'https://example.com/2', alias });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Alias already in use');
  });

  it('should redirect to the original URL', async () => {
    const originalUrl = 'https://example.com/redirect';
    const shortenResponse = await request(app)
      .post(`${basePath}/shorten`)
      .send({ originalUrl });

    const shortUrl = shortenResponse.body.data.shortUrl;
    const redirectResponse = await request(app).get(`/${shortUrl}`);

    expect(redirectResponse.status).toBe(302);
    expect(redirectResponse.headers.location).toBe(originalUrl);
  });

  it('should return 404 for non-existent short URL', async () => {
    const response = await request(app).get('/nonexistent123');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('URL not found');
  });
});
