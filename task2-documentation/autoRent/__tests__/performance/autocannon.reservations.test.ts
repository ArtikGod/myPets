import autocannon from 'autocannon';
import { app } from '../../src/app';
import { Server } from 'http';

const PORT = 3003;
let server: Server;

// Мок данные для тестирования
const mockUserId = '507f1f77bcf86cd799439011';
const mockVehicleId = '507f1f77bcf86cd799439012';
const mockReservationId = '507f1f77bcf86cd799439014';

const testData = {
  reservation: {
    vehicleId: mockVehicleId,
    userId: mockUserId,
    leaseStart: '2024-12-01',
    leaseEnd: '2024-12-05',
    price: 1000,
    status: 'pending'
  },
  reservationUpdate: {
    vehicleId: mockVehicleId,
    leaseStart: '2024-12-02',
    leaseEnd: '2024-12-06',
    status: 'confirmed'
  },
  availabilityCheck: {
    leaseStart: '2024-12-01',
    leaseEnd: '2024-12-05'
  }
};

describe('Reservations Performance Tests', () => {
  beforeAll((done) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('POST /reservations - создание бронирования', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations`,
      connections: 10,
      duration: 10,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify(testData.reservation)
    });

    console.log('POST /reservations Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // Создание бронирования может включать сложную логику проверки доступности
    expect(result.requests.average).toBeGreaterThan(30);
    expect(result.latency.average).toBeLessThan(1500);
  });

  test('GET /reservations/:vehicleId - проверка доступности транспортного средства', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations/${mockVehicleId}`,
      connections: 15,
      duration: 10,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify(testData.availabilityCheck)
    });

    console.log('GET /reservations/:vehicleId Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // Проверка доступности должна быть быстрой
    expect(result.requests.average).toBeGreaterThan(80);
    expect(result.latency.average).toBeLessThan(600);
  });

  test('GET /reservations/ - получение истории бронирований', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations/`,
      connections: 12,
      duration: 10,
      method: 'GET',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('GET /reservations/ Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(70);
    expect(result.latency.average).toBeLessThan(800);
  });

  test('GET /reservations/statistic/completed - статистика завершенных бронирований', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations/statistic/completed`,
      connections: 10,
      duration: 10,
      method: 'GET',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('GET /reservations/statistic/completed Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // Статистические запросы могут быть медленнее из-за агрегации данных
    expect(result.requests.average).toBeGreaterThan(40);
    expect(result.latency.average).toBeLessThan(1200);
  });

  test('GET /reservations/statistic/users - статистика пользователей', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations/statistic/users`,
      connections: 10,
      duration: 10,
      method: 'GET',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('GET /reservations/statistic/users Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(40);
    expect(result.latency.average).toBeLessThan(1200);
  });

  test('PUT /reservations/:reservationsId - обновление бронирования', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations/${mockReservationId}`,
      connections: 8,
      duration: 10,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify(testData.reservationUpdate)
    });

    console.log('PUT /reservations/:reservationsId Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(25);
    expect(result.latency.average).toBeLessThan(1800);
  });

  test('PUT /reservations/cancel/:reservationsId - отмена бронирования', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations/cancel/${mockReservationId}`,
      connections: 8,
      duration: 10,
      method: 'PUT',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('PUT /reservations/cancel/:reservationsId Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(35);
    expect(result.latency.average).toBeLessThan(1000);
  });

  test('Stress test - множественные одновременные бронирования', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/reservations`,
      connections: 30, // Высокая нагрузка для стресс-теста
      duration: 15,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify({
        ...testData.reservation,
        leaseStart: '2024-12-10',
        leaseEnd: '2024-12-12'
      })
    });

    console.log('Stress Test - POST /reservations Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Latency 95th percentile: ${result.latency.p97_5}ms`);
    console.log(`Latency 99th percentile: ${result.latency.p99}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // В стресс-тесте допускаем более низкую производительность
    expect(result.requests.average).toBeGreaterThan(15);
    expect(result.latency.p99).toBeLessThan(8000); // 99-й процентиль не более 8 секунд
  });
});