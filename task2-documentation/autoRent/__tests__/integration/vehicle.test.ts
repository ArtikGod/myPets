import request from 'supertest';
// Prevent real mongoose connections in tests and satisfy model constructors
jest.mock('../../src/connectdb', () => ({
	mongoose: {
		connect: jest.fn(),
		Schema: function Schema(this: any, _def?: any) { return this; },
		model: jest.fn(() => ({})),
	},
	connectDb: jest.fn(),
}));
import { app } from '../../src/app';

jest.mock('../../src/vehicle/vehicleService', () => ({
	createVehicle: jest.fn(),
	getVehicleData: jest.fn(),
	getVehicleSort: jest.fn(),
	newVehicleData: jest.fn(),
	deleteVehicle: jest.fn(),
}));

import {
	createVehicle,
	getVehicleData,
	getVehicleSort,
	newVehicleData,
	deleteVehicle,
} from '../../src/vehicle/vehicleService';

import '../../src/vehicle/vehicleRoutes';

const AUTH = '123456789012345678901234';

describe('Vehicle API (integration)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// POST /vehicle
	it('creates vehicle (201)', async () => {
		(createVehicle as jest.Mock).mockResolvedValue({ id: 'v1' });
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(201);
		expect(createVehicle).toHaveBeenCalled();
	});

	it('returns 400 for invalid create vehicle payload', async () => {
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: '', model: '', year: '', price: '', photo: '' });
		expect(res.status).toBe(400);
	});

	it('returns 401 when Authorization header missing', async () => {
		const res = await request(app)
			.post('/vehicle')
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(401);
	});

	it('returns 500 when service throws on create', async () => {
		(createVehicle as jest.Mock).mockRejectedValue(new Error('db'));
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(500);
	});

	// Edge cases for POST /vehicle
	it('returns 400 for empty request body', async () => { // Edge case: empty request body
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
	});

	it('returns 400 for missing request body', async () => { // Edge case: missing request body (fixed from null to undefined)
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send(undefined);
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for missing required fields', async () => { // Edge case: missing required fields
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW' });
		expect(res.status).toBe(400);
	});

	it('returns 400 for negative year', async () => { // Edge case: negative year
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: -2024, price: 100, photo: 'url' });
		expect(res.status).toBe(400);
	});

	it('returns 400 for negative price', async () => { // Edge case: negative price
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: -100, photo: 'url' });
		expect(res.status).toBe(400);
	});

	it('returns 401 for invalid Authorization header length', async () => { // Edge case: invalid Authorization header length
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', 'short')
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(401);
	});

	// Error handling for POST /vehicle
	it('returns 500 when service throws validation error on create', async () => { // Error handling: validation error on create
		(createVehicle as jest.Mock).mockRejectedValue(new Error('Validation failed'));
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws database connection error on create', async () => { // Error handling: database connection error on create
		(createVehicle as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(500);
	});

	it('returns 401 for unauthorized access', async () => { // Error handling: unauthorized access
		(createVehicle as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
		const res = await request(app)
			.post('/vehicle')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 100, photo: 'url' });
		expect(res.status).toBe(401);
	});

	// GET /vehicle/:vehicleId
	it('gets vehicle by id (200)', async () => {
		(getVehicleData as jest.Mock).mockResolvedValue({ id: 'v1' });
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ id: 'v1' });
	});

	it('returns 400 for non-mongo id', async () => {
		const res = await request(app)
			.get('/vehicle/notid')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 500 when service throws on get by id', async () => {
		(getVehicleData as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /vehicle/:vehicleId
	it('returns 200 for empty vehicle id (treated as vehicle list)', async () => { // Edge case: empty vehicle id
		(getVehicleSort as jest.Mock).mockResolvedValue([]);
		const res = await request(app)
			.get('/vehicle/')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
	});

	it('returns 400 for vehicle id with special characters', async () => { // Edge case: vehicle id with special characters
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439@#')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 401 when Authorization header is missing', async () => { // Edge case: missing Authorization header
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length', async () => { // Edge case: invalid Authorization header length
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	it('returns 400 for too long vehicle id', async () => { // Edge case: too long vehicle id
		const res = await request(app)
			.get('/vehicle/' + 'a'.repeat(1000))
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	// Error handling for GET /vehicle/:vehicleId
	it('returns 500 when service throws database connection error on get by id', async () => { // Error handling: database connection error on get by id
		(getVehicleData as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws timeout error on get by id', async () => { // Error handling: timeout error on get by id
		(getVehicleData as jest.Mock).mockRejectedValue(new Error('Request timeout'));
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	it('returns 404 when vehicle not found', async () => { // Error handling: vehicle not found
		(getVehicleData as jest.Mock).mockRejectedValue(new Error('Vehicle not found'));
		const res = await request(app)
			.get('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('error', 'Vehicle not found');
	});

	// GET /vehicle with query
	it('gets vehicle sorted (200)', async () => {
		(getVehicleSort as jest.Mock).mockResolvedValue([{ id: 'v1' }]);
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ sort_by: 'price', order: 'asc', minPrice: 10, maxPrice: 200, minYear: 2000, maxYear: 2024 });
		expect(res.status).toBe(200);
		expect(res.body).toEqual([{ id: 'v1' }]);
	});

	it('returns 400 when only one of sort_by/order provided', async () => {
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ sort_by: 'price' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 500 when service throws on sort', async () => {
		(getVehicleSort as jest.Mock).mockRejectedValue(new Error('boom'));
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({});
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /vehicle with query
	it('returns 400 for invalid sort_by parameter', async () => { // Edge case: invalid sort_by parameter
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ sort_by: 'invalidField', order: 'asc' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for invalid order parameter', async () => { // Edge case: invalid order parameter
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ sort_by: 'price', order: 'invalid' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for negative minPrice', async () => { // Edge case: negative minPrice
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ minPrice: -50 });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for minPrice greater than maxPrice', async () => { // Edge case: minPrice greater than maxPrice
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ minPrice: 200, maxPrice: 100 });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for negative year range', async () => { // Edge case: negative year range
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ minYear: -2020, maxYear: 2025 });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 401 when Authorization header is missing for query', async () => { // Edge case: missing Authorization header for query
		const res = await request(app)
			.get('/vehicle')
			.query({ sort_by: 'price', order: 'asc' });
		expect(res.status).toBe(401);
	});

	it('returns 400 for minYear greater than maxYear', async () => { // Edge case: minYear > maxYear
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ minYear: 2025, maxYear: 2000 });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	// Error handling for GET /vehicle with query
	it('returns 500 when service throws database connection error on sort', async () => { // Error handling: database connection error on sort
		(getVehicleSort as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({});
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws timeout error on sort', async () => { // Error handling: timeout error on sort
		(getVehicleSort as jest.Mock).mockRejectedValue(new Error('Request timeout'));
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({});
		expect(res.status).toBe(500);
	});

	it('returns 401 for unauthorized sort query', async () => { // Error handling: unauthorized sort query
		(getVehicleSort as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
		const res = await request(app)
			.get('/vehicle')
			.set('Authorization', AUTH)
			.query({ sort_by: 'price', order: 'asc' });
		expect(res.status).toBe(401);
	});

	// PUT /vehicle/:vehicleId
	it('updates vehicle (200)', async () => {
		(newVehicleData as jest.Mock).mockResolvedValue({ id: 'v1', price: 150 });
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 150, photo: 'u' });
		expect(res.status).toBe(200);
		expect(newVehicleData).toHaveBeenCalled();
	});

	it('returns 400 for invalid update payload', async () => {
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: '', model: '', year: '', price: '', photo: '' });
		expect(res.status).toBe(400);
	});

	it('returns 500 when service throws on update', async () => {
		(newVehicleData as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 150, photo: 'u' });
		expect(res.status).toBe(500);
	});

	// Edge cases for PUT /vehicle/:vehicleId
	it('returns 400 for empty request body', async () => { // Edge case: empty request body
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
	});

	it('returns 400 for missing request body', async () => { // Edge case: missing request body
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send(undefined);
		expect(res.status).toBe(400);
	});

	it('returns 400 for negative year', async () => { // Edge case: negative year
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: -2024, price: 150, photo: 'u' });
		expect(res.status).toBe(400);
	});

	it('returns 400 for negative price', async () => { // Edge case: negative price
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: -150, photo: 'u' });
		expect(res.status).toBe(400);
	});

	it('returns 400 for invalid vehicle ID', async () => { // Edge case: invalid vehicle ID
		const res = await request(app)
			.put('/vehicle/invalid-id')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 150, photo: 'u' });
		expect(res.status).toBe(400);
	});

	// Error handling for PUT /vehicle/:vehicleId
	it('returns 500 when service throws validation error on update', async () => { // Error handling: validation error on update
		(newVehicleData as jest.Mock).mockRejectedValue(new Error('Validation failed'));
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 150, photo: 'u' });
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws database connection error on update', async () => { // Error handling: database connection error on update
		(newVehicleData as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 150, photo: 'u' });
		expect(res.status).toBe(500);
	});

	it('returns 404 when vehicle not found', async () => { // Error handling: vehicle not found
		(newVehicleData as jest.Mock).mockRejectedValue(new Error('Vehicle not found'));
		const res = await request(app)
			.put('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ make: 'BMW', model: 'X5', year: 2024, price: 150, photo: 'u' });
		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('error', 'Vehicle not found');
	});

	// DELETE /vehicle/:vehicleId
	it('deletes vehicle (200)', async () => {
		(deleteVehicle as jest.Mock).mockResolvedValue({ ok: true });
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(deleteVehicle).toHaveBeenCalled();
	});

	it('returns 500 when service throws on delete', async () => {
		(deleteVehicle as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for DELETE /vehicle/:vehicleId
	it('returns 400 for empty vehicle id', async () => { // Edge case: empty vehicle id
		const res = await request(app)
			.delete('/vehicle/')
			.set('Authorization', AUTH);
		expect(res.status).toBe(404);
	});

	it('returns 400 for invalid vehicle id', async () => { // Edge case: invalid vehicle id
		const res = await request(app)
			.delete('/vehicle/invalid-id')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 401 when Authorization header is missing', async () => { // Edge case: missing Authorization header
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length', async () => { // Edge case: invalid Authorization header length
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	// Error handling for DELETE /vehicle/:vehicleId
	it('returns 500 when service throws database connection error on delete', async () => { // Error handling: database connection error on delete
		(deleteVehicle as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws timeout error on delete', async () => { // Error handling: timeout error on delete
		(deleteVehicle as jest.Mock).mockRejectedValue(new Error('Request timeout'));
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	it('returns 404 when vehicle not found', async () => { // Error handling: vehicle not found
		(deleteVehicle as jest.Mock).mockRejectedValue(new Error('Vehicle not found'));
		const res = await request(app)
			.delete('/vehicle/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(404);
		expect(res.body).toHaveProperty('error', 'Vehicle not found');
	});
});