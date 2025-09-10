import autocannon from 'autocannon';
import { app } from '../../src/app';
import { Server } from 'http';

const PORT = 3001;
let server: Server;

// Мок данные для тестирования
const mockUserId = '507f1f77bcf86cd799439011';
const mockVehicleId = '507f1f77bcf86cd799439012';

const testData = {
  vehicle: {
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    price: 50000,
    photo: 'https://example.com/photo.jpg'
  }
};

describe('Vehicle Performance Tests', () => {
  beforeAll((done) => {
    server = app.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      done();
    });
  });

  afterAll((done) => {
    server.close(done);
  });

  test('POST /vehicle - создание транспортного средства', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/vehicle`,
      connections: 10,
      duration: 10,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify(testData.vehicle)
    });

    console.log('POST /vehicle Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    // Проверяем, что производительность в приемлемых пределах
    expect(result.requests.average).toBeGreaterThan(50); // минимум 50 RPS
    expect(result.latency.average).toBeLessThan(1000); // максимум 1 секунда
  });

  test('GET /vehicle/:vehicleId - получение данных транспортного средства', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/vehicle/${mockVehicleId}`,
      connections: 10,
      duration: 10,
      method: 'GET',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('GET /vehicle/:vehicleId Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(100); // GET должен быть быстрее
    expect(result.latency.average).toBeLessThan(500);
  });

  test('GET /vehicle - получение списка транспортных средств с сортировкой', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/vehicle?sort_by=price&order=asc`,
      connections: 10,
      duration: 10,
      method: 'GET',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('GET /vehicle (with sorting) Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(80);
    expect(result.latency.average).toBeLessThan(800);
  });

  test('PUT /vehicle/:vehicleId - обновление данных транспортного средства', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/vehicle/${mockVehicleId}`,
      connections: 10,
      duration: 10,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': mockUserId
      },
      body: JSON.stringify({
        ...testData.vehicle,
        price: 55000
      })
    });

    console.log('PUT /vehicle/:vehicleId Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(40);
    expect(result.latency.average).toBeLessThan(1200);
  });

  test('DELETE /vehicle/:vehicleId - удаление транспортного средства', async () => {
    const result = await autocannon({
      url: `http://localhost:${PORT}/vehicle/${mockVehicleId}`,
      connections: 5, // Меньше соединений для DELETE
      duration: 5,
      method: 'DELETE',
      headers: {
        'Authorization': mockUserId
      }
    });

    console.log('DELETE /vehicle/:vehicleId Performance Results:');
    console.log(`Requests per second: ${result.requests.average}`);
    console.log(`Latency average: ${result.latency.average}ms`);
    console.log(`Throughput: ${result.throughput.average} bytes/sec`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);

    expect(result.requests.average).toBeGreaterThan(30);
    expect(result.latency.average).toBeLessThan(1500);
  });
});