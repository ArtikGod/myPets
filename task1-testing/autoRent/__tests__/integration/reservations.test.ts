import request from 'supertest';
// Prevent real mongoose connections in tests and satisfy model constructors
jest.mock('../../src/connectdb', () => ({
	mongoose: {
		connect: jest.fn(),
		Schema: function Schema(this: any, _def?: any) { return this; },
		model: jest.fn(() => ({})),
	},
}));
import { app } from '../../src/app';

jest.mock('../../src/reservations/reservationsService', () => ({
	createReservations: jest.fn(),
	getReservationsVehicleAvailable: jest.fn(),
	getStatisticComletedReservations: jest.fn(),
	getStatisticUsers: jest.fn(),
	getReservationsHistory: jest.fn(),
	updateReservations: jest.fn(),
	cancelReservations: jest.fn(),
}));

import {
	createReservations,
	getReservationsVehicleAvailable,
	getStatisticComletedReservations,
	getStatisticUsers,
	getReservationsHistory,
	updateReservations,
	cancelReservations,
} from '../../src/reservations/reservationsService';

import '../../src/reservations/reservationsRoutes';

const AUTH = '123456789012345678901234';

describe('Reservations API (integration)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// POST /reservations
	it('creates reservation (201)', async () => {
		(createReservations as jest.Mock).mockResolvedValue({ id: 'r1' });
		const futureStart = '2099-01-01';
		const futureEnd = '2099-01-10';
		const res = await request(app)
			.post('/reservations')
			.set('Authorization', AUTH)
			.send({
				vehicleId: '507f1f77bcf86cd799439011',
				userId: '507f1f77bcf86cd799439012',
				leaseStart: futureStart,
				leaseEnd: futureEnd,
				price: 100,
				status: 'Created',
			});
		expect(res.status).toBe(201);
		expect(createReservations).toHaveBeenCalled();
	});

	it('returns 400 for invalid reservation body', async () => {
		const res = await request(app)
			.post('/reservations')
			.set('Authorization', AUTH)
			.send({ vehicleId: 'bad', userId: 'bad', leaseStart: 'bad', leaseEnd: 'bad', price: '' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 401 when Authorization missing for create', async () => {
		const res = await request(app)
			.post('/reservations')
			.send({});
		expect(res.status).toBe(401);
	});

	it('returns 500 when service throws on create', async () => {
		(createReservations as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.post('/reservations')
			.set('Authorization', AUTH)
			.send({
				vehicleId: '507f1f77bcf86cd799439011',
				userId: '507f1f77bcf86cd799439012',
				leaseStart: '2099-01-01',
				leaseEnd: '2099-01-10',
				price: 100,
			});
		expect(res.status).toBe(500);
	});

	// Edge cases for POST /reservations
	it('returns 400 for empty create body', async () => { // Edge case: empty request body
		const res = await request(app)
			.post('/reservations')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for null create body', async () => { // Edge case: null request body
		const res = await request(app)
			.post('/reservations')
			.set('Authorization', AUTH)
			.send(null as any);
		expect(res.status).toBe(400);
	});

	it('returns 401 for invalid Authorization header length on create', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.post('/reservations')
			.set('Authorization', 'short')
			.send({
				vehicleId: '507f1f77bcf86cd799439011',
				userId: '507f1f77bcf86cd799439012',
				leaseStart: '2099-01-01',
				leaseEnd: '2099-01-10',
				price: 100,
				status: 'Created',
			});
		expect(res.status).toBe(401);
	});

	// GET /reservations/statistic/completed
	it('gets completed statistics (200)', async () => {
		(getStatisticComletedReservations as jest.Mock).mockResolvedValue({ total: 5 });
		const res = await request(app)
			.get('/reservations/statistic/completed')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ total: 5 });
	});

	it('returns 500 when service throws on completed statistics', async () => {
		(getStatisticComletedReservations as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.get('/reservations/statistic/completed')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /reservations/statistic/completed
	it('returns 200 with empty statistics result', async () => { // Edge case: empty stats
		(getStatisticComletedReservations as jest.Mock).mockResolvedValue([]);
		const res = await request(app)
			.get('/reservations/statistic/completed')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('returns 401 when Authorization header missing for completed statistics', async () => { // Edge case: missing Authorization
		const res = await request(app)
			.get('/reservations/statistic/completed');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length for completed statistics', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.get('/reservations/statistic/completed')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	// GET /reservations/statistic/users
	it('gets users statistics (200)', async () => {
		(getStatisticUsers as jest.Mock).mockResolvedValue([{ userId: 'u1', count: 2 }]);
		const res = await request(app)
			.get('/reservations/statistic/users')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual([{ userId: 'u1', count: 2 }]);
	});

	it('returns 500 when service throws on users statistics', async () => {
		(getStatisticUsers as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.get('/reservations/statistic/users')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /reservations/statistic/users
	it('returns 200 with empty users statistics result', async () => { // Edge case: empty users stats
		(getStatisticUsers as jest.Mock).mockResolvedValue([]);
		const res = await request(app)
			.get('/reservations/statistic/users')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('returns 401 when Authorization header missing for users statistics', async () => { // Edge case: missing Authorization
		const res = await request(app)
			.get('/reservations/statistic/users');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length for users statistics', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.get('/reservations/statistic/users')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	// GET /reservations/:vehicleId with body dates
	it('gets vehicle availability (200)', async () => {
		(getReservationsVehicleAvailable as jest.Mock).mockResolvedValue([{ id: 'r1' }]);
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ leaseStart: '2099-01-01', leaseEnd: '2099-01-10' });
		expect(res.status).toBe(200);
		expect(res.body).toEqual([{ id: 'r1' }]);
	});

	it('returns 400 for invalid params/body in availability', async () => {
		const res = await request(app)
			.get('/reservations/notid')
			.set('Authorization', AUTH)
			.send({ leaseStart: 'x', leaseEnd: 'y' });
		expect(res.status).toBe(400);
	});

	it('returns 500 when service throws on availability', async () => {
		(getReservationsVehicleAvailable as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ leaseStart: '2099-01-01', leaseEnd: '2099-01-10' });
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /reservations/:vehicleId
	it('returns 400 for empty body in availability request', async () => { // Edge case: empty body
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 500 when leaseStart is after leaseEnd', async () => { // Edge case: date order
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ leaseStart: '2099-02-01', leaseEnd: '2099-01-10' });
		expect(res.status).toBe(500);
	});

	it('returns 400 for null body in availability request', async () => { // Edge case: null body
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send(null as any);
		expect(res.status).toBe(400);
	});

	it('returns 401 when Authorization header is missing for availability', async () => { // Edge case: missing Authorization
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.send({ leaseStart: '2099-01-01', leaseEnd: '2099-01-10' });
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length for availability', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.get('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', 'short')
			.send({ leaseStart: '2099-01-01', leaseEnd: '2099-01-10' });
		expect(res.status).toBe(401);
	});

	// GET /reservations/
	it('gets reservations history (200)', async () => {
		(getReservationsHistory as jest.Mock).mockResolvedValue([{ id: 'r1' }]);
		const res = await request(app)
			.get('/reservations/')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual([{ id: 'r1' }]);
	});

	it('returns 500 when service throws on history', async () => {
		(getReservationsHistory as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.get('/reservations/')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /reservations/
	it('returns 200 with empty history list', async () => { // Edge case: empty history
		(getReservationsHistory as jest.Mock).mockResolvedValue([]);
		const res = await request(app)
			.get('/reservations/')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual([]);
	});

	it('returns 401 when Authorization header missing for history', async () => { // Edge case: missing Authorization
		const res = await request(app)
			.get('/reservations/');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length for history', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.get('/reservations/')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	// PUT /reservations/:reservationsId
	it('updates reservation (200)', async () => {
		(updateReservations as jest.Mock).mockResolvedValue({ id: 'r1', status: 'Updated' });
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({
				vehicleId: '507f1f77bcf86cd799439011',
				leaseStart: '2099-01-01',
				leaseEnd: '2099-01-10',
				status: 'Paid',
			});
		expect(res.status).toBe(200);
		expect(updateReservations).toHaveBeenCalled();
	});

	it('returns 400 for invalid update body', async () => {
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ vehicleId: 'bad', leaseStart: 'x', leaseEnd: 'y' });
		expect(res.status).toBe(400);
	});

	it('returns 500 when service throws on update', async () => {
		(updateReservations as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({
				vehicleId: '507f1f77bcf86cd799439011',
				leaseStart: '2099-01-01',
				leaseEnd: '2099-01-10',
				status: 'Paid',
			});
		expect(res.status).toBe(500);
	});

	// Edge cases for PUT /reservations/:reservationsId
	it('returns 400 for invalid reservations id on update', async () => { // Edge case: invalid id
		const res = await request(app)
			.put('/reservations/notid')
			.set('Authorization', AUTH)
			.send({ vehicleId: '507f1f77bcf86cd799439011', leaseStart: '2099-01-01', leaseEnd: '2099-01-10', status: 'Paid' });
		expect(res.status).toBe(400);
	});

	it('returns 400 for empty update body', async () => { // Edge case: empty body
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
	});

	it('returns 400 for null update body', async () => { // Edge case: null body
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send(null as any);
		expect(res.status).toBe(400);
	});

	it('returns 401 when Authorization header missing for update', async () => { // Edge case: missing Authorization
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.send({ vehicleId: '507f1f77bcf86cd799439011', leaseStart: '2099-01-01', leaseEnd: '2099-01-10', status: 'Paid' });
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length for update', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.put('/reservations/507f1f77bcf86cd799439011')
			.set('Authorization', 'short')
			.send({ vehicleId: '507f1f77bcf86cd799439011', leaseStart: '2099-01-01', leaseEnd: '2099-01-10', status: 'Paid' });
		expect(res.status).toBe(401);
	});

	// PUT /reservations/cancel/:reservationsId
	it('cancels reservation (200)', async () => {
		(cancelReservations as jest.Mock).mockResolvedValue({ id: 'r1', status: 'Cancel' });
		const res = await request(app)
			.put('/reservations/cancel/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(cancelReservations).toHaveBeenCalled();
	});

	it('returns 400 for invalid cancel id', async () => {
		const res = await request(app)
			.put('/reservations/cancel/notid')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 500 when service throws on cancel', async () => {
		(cancelReservations as jest.Mock).mockRejectedValue(new Error('err'));
		const res = await request(app)
			.put('/reservations/cancel/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for PUT /reservations/cancel/:reservationsId
	it('returns 401 when Authorization header missing for cancel', async () => { // Edge case: missing Authorization
		const res = await request(app)
			.put('/reservations/cancel/507f1f77bcf86cd799439011');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length for cancel', async () => { // Edge case: invalid Authorization
		const res = await request(app)
			.put('/reservations/cancel/507f1f77bcf86cd799439011')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});
});
