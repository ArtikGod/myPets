import autocannon from 'autocannon';
import { app } from '../../src/app';
import { Server } from 'http';

const PORT = 3002;
let server: Server;

// Мок данные для тестирования
const mockUserId = '507f1f77bcf86cd799439011';
const mockTargetUserId = '507f1f77bcf86cd799439013';

const testData = {
  user: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword123',
    roles: ['user']
  },
  license: {
    numberLicens: '1234567890',
    dateRelease: '2023-01-01',
    dateValidity: '2028-01-01'
  },
  userUpdate: {
    email: 'updated@example.com',
    numberLicens: '0987654321',
    dateRelease: '2023-06-01',
    dateValidity: '2028-06-01'
  }
};

describe('Users Performance Tests', () => {
  beforeAll((done) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('POST /users - создание пользователя', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/users`,
      connections: 10,
      duration: 10,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData.user)
    });

    console.log('POST /users Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // Создание пользователя может быть медленнее из-за хеширования пароля
    expect(result.requests.average).toBeGreaterThan(20);
    expect(result.latency.average).toBeLessThan(2000);
  });

  test('POST /users/licens - создание лицензии пользователя', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/users/licens`,
      connections: 10,
      duration: 10,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify(testData.license)
    });

    console.log('POST /users/licens Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(40);
    expect(result.latency.average).toBeLessThan(1000);
  });

  test('GET /users/:id - получение данных пользователя', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/users/${mockTargetUserId}`,
      connections: 10,
      duration: 10,
      method: 'GET',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('GET /users/:id Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // GET операции должны быть быстрыми
    expect(result.requests.average).toBeGreaterThan(100);
    expect(result.latency.average).toBeLessThan(500);
  });

  test('PUT /users/:id - обновление данных пользователя', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/users/${mockTargetUserId}`,
      connections: 10,
      duration: 10,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify(testData.userUpdate)
    });

    console.log('PUT /users/:id Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(30);
    expect(result.latency.average).toBeLessThan(1500);
  });

  test('DELETE /users/:id - удаление пользователя', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/users/${mockTargetUserId}`,
      connections: 5, // Меньше соединений для DELETE
      duration: 5,
      method: 'DELETE',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('DELETE /users/:id Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(25);
    expect(result.latency.average).toBeLessThan(2000);
  });

  test('Stress test - множественные одновременные запросы создания пользователей', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/users`,
      connections: 50, // Больше соединений для стресс-теста
      duration: 15,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...testData.user,
        email: `stress-${Date.now()}@example.com`
      })
    });

    console.log('Stress Test - POST /users Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Latency 99th percentile: ${result.latency.p99}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // В стресс-тесте допускаем более низкую производительность
    expect(result.requests.average).toBeGreaterThan(10);
    expect(result.latency.p99).toBeLessThan(5000); // 99-й процентиль не более 5 секунд
  });
});