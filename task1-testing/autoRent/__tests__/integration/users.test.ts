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

// Mock the user service methods used by the route module
jest.mock('../../src/users/userService', () => ({
	createUser: jest.fn(),
	createLicens: jest.fn(),
	getUser: jest.fn(),
	editUser: jest.fn(),
	deleteUser: jest.fn(),
}));

import {
	createUser,
	createLicens,
	getUser,
	editUser,
	deleteUser,
} from '../../src/users/userService';

// Import routes to register them with the app (the module side-effect registers routes)
import '../../src/users/userRoutes';

const AUTH = '123456789012345678901234'; // 24 chars to pass middleware

describe('Users API (integration)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	// POST /users
	it('creates a user successfully (201)', async () => {
		(createUser as jest.Mock).mockResolvedValue({ id: 'u1', username: 'john', email: 'john@example.com' });
		const res = await request(app)
			.post('/users')
			.send({ username: 'john', email: 'john@example.com', password: 'StrongP@ssw0rd!', roles: ['driver'] });
		expect(res.status).toBe(201);
		expect(res.body).toEqual({ id: 'u1', username: 'john', email: 'john@example.com' });
		expect(createUser).toHaveBeenCalledWith('john', 'john@example.com', 'StrongP@ssw0rd!', ['driver']);
	});

	it('returns 400 for invalid create payload', async () => {
		const res = await request(app).post('/users').send({ username: '', email: 'bad', password: '123' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 500 when service throws on create', async () => {
		(createUser as jest.Mock).mockRejectedValue(new Error('db down'));
		const res = await request(app)
			.post('/users')
			.send({ username: 'john', email: 'john@example.com', password: 'StrongP@ssw0rd!' });
		expect(res.status).toBe(500);
	});

	// Edge cases for POST /users
	it('returns 400 for empty request body', async () => { // Edge case: empty request body
		const res = await request(app).post('/users').send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for undefined request body', async () => { // Edge case: null request body
		const res = await request(app).post('/users').send(undefined);
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for missing required fields', async () => { // Edge case: missing required fields
		const res = await request(app).post('/users').send({ username: 'john' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for extremely long username', async () => { // Edge case: extremely long username
		const longUsername = 'a'.repeat(1000);
		const res = await request(app).post('/users').send({ 
			username: longUsername, 
			email: 'test@example.com', 
			password: 'StrongP@ssw0rd!' 
		});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for extremely long email', async () => { // Edge case: extremely long email
		const longEmail = 'a'.repeat(1000) + '@example.com';
		const res = await request(app).post('/users').send({ 
			username: 'john', 
			email: longEmail, 
			password: 'StrongP@ssw0rd!' 
		});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	// Error handling for POST /users
	it('returns 500 when service throws validation error', async () => { // Error handling: validation error
		(createUser as jest.Mock).mockRejectedValue(new Error('Validation failed'));
		const res = await request(app)
			.post('/users')
			.send({ username: 'john', email: 'john@example.com', password: 'StrongP@ssw0rd!' });
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws database connection error', async () => { // Error handling: database connection error
		(createUser as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.post('/users')
			.send({ username: 'john', email: 'john@example.com', password: 'StrongP@ssw0rd!' });
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws timeout error', async () => { // Error handling: timeout error
		(createUser as jest.Mock).mockRejectedValue(new Error('Request timeout'));
		const res = await request(app)
			.post('/users')
			.send({ username: 'john', email: 'john@example.com', password: 'StrongP@ssw0rd!' });
		expect(res.status).toBe(500);
	});

	// POST /users/licens
	it('adds licens successfully (200)', async () => {
		(createLicens as jest.Mock).mockResolvedValue({ ok: true });
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: '1234567890', dateRelease: '2099-01-01', dateValidity: '2099-12-31' });
		expect(res.status).toBe(200);
		expect(createLicens).toHaveBeenCalled();
	});

	it('returns 401 when Authorization header missing for licens', async () => {
		const res = await request(app)
			.post('/users/licens')
			.send({ numberLicens: '1234567890', dateRelease: '2099-01-01', dateValidity: '2099-12-31' });
		expect(res.status).toBe(401);
	});

	it('returns 400 for invalid licens payload', async () => {
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: 'bad', dateRelease: '', dateValidity: '' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 500 when service throws on licens', async () => {
		(createLicens as jest.Mock).mockRejectedValue(new Error('boom'));
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: '1234567890', dateRelease: '2099-01-01', dateValidity: '2099-12-31' });
		expect(res.status).toBe(500);
	});

	// Edge cases for POST /users/licens
	it('returns 400 for empty licens payload', async () => { // Edge case: empty licens payload
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for undefined licens payload', async () => { // Edge case: null licens payload
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send(undefined);
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for missing required licens fields', async () => { // Edge case: missing required licens fields
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: '1234567890' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 400 for invalid date format in licens', async () => { // Edge case: invalid date format in licens
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: '1234567890', dateRelease: 'invalid-date', dateValidity: '2099-12-31' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('errors');
	});

	it('returns 401 for invalid Authorization header length', async () => { // Edge case: invalid Authorization header length
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', 'short')
			.send({ numberLicens: '1234567890', dateRelease: '2099-01-01', dateValidity: '2099-12-31' });
		expect(res.status).toBe(401);
	});

	// Error handling for POST /users/licens
	it('returns 500 when service throws validation error on licens', async () => { // Error handling: validation error on licens
		(createLicens as jest.Mock).mockRejectedValue(new Error('Validation failed'));
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: '1234567890', dateRelease: '2099-01-01', dateValidity: '2099-12-31' });
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws database connection error on licens', async () => { // Error handling: database connection error on licens
		(createLicens as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.post('/users/licens')
			.set('Authorization', AUTH)
			.send({ numberLicens: '1234567890', dateRelease: '2099-01-01', dateValidity: '2099-12-31' });
		expect(res.status).toBe(500);
	});

	// GET /users/:id
	it('gets user by id (200)', async () => {
		(getUser as jest.Mock).mockResolvedValue({ id: 'u1' });
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(res.body).toEqual({ id: 'u1' });
	});

	it('returns 400 for invalid mongo id', async () => {
		const res = await request(app)
			.get('/users/not-a-mongoid')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 401 for invalid Authorization length', async () => {
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	it('returns 500 when service throws on get', async () => {
		(getUser as jest.Mock).mockRejectedValue(new Error('fail'));
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for GET /users/:id
	it('returns 400 for empty user id', async () => { // Edge case: empty user id
		const res = await request(app)
			.get('/users/')
			.set('Authorization', AUTH);
		expect(res.status).toBe(404);
	});

	it('returns 400 for user id with special characters', async () => { // Edge case: user id with special characters
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439@#')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 401 when Authorization header is missing', async () => { // Edge case: missing Authorization header
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011');
		expect(res.status).toBe(401);
	});

	it('returns 401 when Authorization header is null', async () => { // Edge case: null Authorization header
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011')
			.set('Authorization', null as any);
		expect(res.status).toBe(401);
	});

	// Error handling for GET /users/:id
	it('returns 500 when service throws database connection error on get', async () => { // Error handling: database connection error on get
		(getUser as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws timeout error on get', async () => { // Error handling: timeout error on get
		(getUser as jest.Mock).mockRejectedValue(new Error('Request timeout'));
		const res = await request(app)
			.get('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// PUT /users/:id
	it('updates user (200)', async () => {
		(editUser as jest.Mock).mockResolvedValue({ id: 'u1', email: 'new@example.com' });
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({
				email: 'new@example.com',
				numberLicens: '1234567890',
				dateRelease: '2099-01-01',
				dateValidity: '2099-12-31',
			});
		expect(res.status).toBe(200);
		expect(editUser).toHaveBeenCalled();
	});

	it('returns 400 for invalid update payload', async () => {
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ email: 'bad', numberLicens: 'x', dateRelease: '', dateValidity: '' });
		expect(res.status).toBe(400);
	});

	it('returns 500 when service throws on update', async () => {
		(editUser as jest.Mock).mockRejectedValue(new Error('oops'));
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({
				email: 'new@example.com',
				numberLicens: '1234567890',
				dateRelease: '2099-01-01',
				dateValidity: '2099-12-31',
			});
		expect(res.status).toBe(500);
	});

	// Edge cases for PUT /users/:id
	it('returns 400 for empty update payload', async () => { // Edge case: empty update payload
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({});
		expect(res.status).toBe(400);
	});

	it('returns 400 for undefined update payload', async () => { // Edge case: null update payload
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send(undefined);
		expect(res.status).toBe(400);
	});

	it('returns 400 for invalid user id in update', async () => { // Edge case: invalid user id in update
		const res = await request(app)
			.put('/users/invalid-id')
			.set('Authorization', AUTH)
			.send({ email: 'new@example.com' });
		expect(res.status).toBe(400);
	});

	it('returns 401 for missing Authorization header in update', async () => { // Edge case: missing Authorization header in update
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.send({ email: 'new@example.com' });
		expect(res.status).toBe(401);
	});

	// Error handling for PUT /users/:id
	it('returns 500 when service throws validation error on update', async () => { // Error handling: validation error on update
		(editUser as jest.Mock).mockRejectedValue(new Error('Validation failed'));
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ email: 'new@example.com' });
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws database connection error on update', async () => { // Error handling: database connection error on update
		(editUser as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.put('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH)
			.send({ email: 'new@example.com' });
		expect(res.status).toBe(500);
	});

	// DELETE /users/:id
	it('deletes user (200)', async () => {
		(deleteUser as jest.Mock).mockResolvedValue({ ok: true });
		const res = await request(app)
			.delete('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(200);
		expect(deleteUser).toHaveBeenCalled();
	});

	it('returns 500 when service throws on delete', async () => {
		(deleteUser as jest.Mock).mockRejectedValue(new Error('nope'));
		const res = await request(app)
			.delete('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	// Edge cases for DELETE /users/:id
	it('returns 400 for invalid user id in delete', async () => { // Edge case: invalid user id in delete
		const res = await request(app)
			.delete('/users/invalid-id')
			.set('Authorization', AUTH);
		expect(res.status).toBe(400);
	});

	it('returns 401 for missing Authorization header in delete', async () => { // Edge case: missing Authorization header in delete
		const res = await request(app)
			.delete('/users/507f1f77bcf86cd799439011');
		expect(res.status).toBe(401);
	});

	it('returns 401 for invalid Authorization header length in delete', async () => { // Edge case: invalid Authorization header length in delete
		const res = await request(app)
			.delete('/users/507f1f77bcf86cd799439011')
			.set('Authorization', 'short');
		expect(res.status).toBe(401);
	});

	// Error handling for DELETE /users/:id
	it('returns 500 when service throws database connection error on delete', async () => { // Error handling: database connection error on delete
		(deleteUser as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
		const res = await request(app)
			.delete('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});

	it('returns 500 when service throws timeout error on delete', async () => { // Error handling: timeout error on delete
		(deleteUser as jest.Mock).mockRejectedValue(new Error('Request timeout'));
		const res = await request(app)
			.delete('/users/507f1f77bcf86cd799439011')
			.set('Authorization', AUTH);
		expect(res.status).toBe(500);
	});
});
