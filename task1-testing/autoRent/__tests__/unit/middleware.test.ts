import { checkAuthorization } from '../../src/middleware';

describe('middleware - checkAuthorization', () => {
	it('returns 401 when Authorization header missing', () => {
		const req: any = { headers: {} };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({ error: 'Authorization header is missing' });
		expect(next).not.toHaveBeenCalled();
	});

	it('returns 401 when userId length not 24', () => {
		const req: any = { headers: { authorization: 'short' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({ error: 'UserId not valid' });
		expect(next).not.toHaveBeenCalled();
	});

	it('calls next() for valid 24-char userId', () => {
		const req: any = { headers: { authorization: '123456789012345678901234' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	// Edge cases
	it('handles null headers', () => { // Edge case: null headers
		const req: any = { headers: null };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		expect(() => checkAuthorization(req, res, next)).toThrow();
	});

	it('handles undefined headers', () => { // Edge case: undefined headers
		const req: any = {};
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		expect(() => checkAuthorization(req, res, next)).toThrow();
	});

	it('handles empty authorization header', () => { // Edge case: empty authorization header
		const req: any = { headers: { authorization: '' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({ error: 'Authorization header is missing' });
		expect(next).not.toHaveBeenCalled();
	});

	it('handles authorization header with only spaces', () => { // Edge case: authorization header with only spaces
		const req: any = { headers: { authorization: '   ' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({ error: 'Authorization header is missing' });
		expect(next).not.toHaveBeenCalled();
	});

	it('handles authorization header with special characters', () => { // Edge case: authorization header with special characters
		const req: any = { headers: { authorization: '12345678901234567890123@' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('handles authorization header with exactly 23 characters', () => { // Edge case: authorization header with exactly 23 characters
		const req: any = { headers: { authorization: '12345678901234567890123' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({ error: 'UserId not valid' });
		expect(next).not.toHaveBeenCalled();
	});

	it('handles authorization header with exactly 25 characters', async () => { // Edge case: authorization header with exactly 25 characters
		const req: any = { headers: { authorization: '1234567890123456789012345' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		checkAuthorization(req, res, next);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({ error: 'UserId not valid' });
		expect(next).not.toHaveBeenCalled();
	});

	// Error handling
	it('handles null request object', () => { // Error handling: null request object
		const req: any = null;
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next = jest.fn();

		expect(() => checkAuthorization(req, res, next)).toThrow();
	});

	it('handles null response object', () => { // Error handling: null response object
		const req: any = { headers: { authorization: '123456789012345678901234' } };
		const res: any = null;
		const next = jest.fn();

		expect(() => checkAuthorization(req, res, next)).not.toThrow();
		expect(next).toHaveBeenCalled();
	});

	it('handles null next function', () => { // Error handling: null next function
		const req: any = { headers: { authorization: '123456789012345678901234' } };
		const res = {
			status: jest.fn().mockReturnThis(),
			send: jest.fn(),
		} as any;
		const next: any = null;

		expect(() => checkAuthorization(req, res, next)).toThrow();
	});
});
