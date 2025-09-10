import autocannon from 'autocannon';
import { app } from '../../src/app';
import { Server } from 'http';

const PORT = 3005;
let server: Server;

describe('Simple Health Check Test', () => {
  beforeAll((done) => {
    server = app.listen(PORT, () => {
      console.log(`Health check test server running on port ${PORT}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('Health check endpoint should work', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/health`,
      connections: 5,
      duration: 3,
      method: 'GET'
    });

    console.log('Health Check Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // Health check должен работать без ошибок
    expect(result.requests.average).toBeGreaterThan(0);
    expect(result.errors).toBe(0);
  });
});