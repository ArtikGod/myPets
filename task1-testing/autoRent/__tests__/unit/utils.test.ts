import utils from '../../src/utils';
import { User } from '../../src/users/userModel';
import { Vehicle } from '../../src/vehicle/vehicleModel';
import { VEHICLE_NOT_EXIST, USER_NOT_EXIST, FORBIDDEN, EMAIL_EXIST, LICENS_EXIST } from '../../src/constants';

jest.mock('../../src/users/userModel', () => ({
	User: {
		findOne: jest.fn(),
		findById: jest.fn(),
	}
}));

jest.mock('../../src/vehicle/vehicleModel', () => ({
	Vehicle: {
		findOne: jest.fn(),
	}
}));

describe('utils', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('userExist', () => {
		it('resolves when user exists', async () => {
			(User.findOne as jest.Mock).mockResolvedValue({ _id: '123' });
			await expect(utils.userExist('123')).resolves.toBeUndefined();
		});

		it('throws when user not found', async () => {
			(User.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.userExist('missing')).rejects.toThrow(USER_NOT_EXIST);
		});

		it('propagates model errors', async () => {
			(User.findOne as jest.Mock).mockRejectedValue(new Error('db error'));
			await expect(utils.userExist('123')).rejects.toThrow('db error');
		});

		// Edge cases
		it('handles empty user ID', async () => { // Edge case: empty user ID
			await expect(utils.userExist('')).rejects.toThrow();
		});

		it('handles null user ID', async () => { // Edge case: null user ID
			await expect(utils.userExist(null as any)).rejects.toThrow();
		});

		it('handles undefined user ID', async () => { // Edge case: undefined user ID
			await expect(utils.userExist(undefined as any)).rejects.toThrow();
		});

		it('handles user ID with special characters', async () => { // Edge case: user ID with special characters
			(User.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.userExist('123@#$')).rejects.toThrow(USER_NOT_EXIST);
		});

		// Error handling
		it('handles database connection error', async () => { // Error handling: database connection error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(utils.userExist('123')).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(utils.userExist('123')).rejects.toThrow('Request timeout');
		});

		it('handles validation error', async () => { // Error handling: validation error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Invalid ObjectId'));
			await expect(utils.userExist('123')).rejects.toThrow('Invalid ObjectId');
		});
	});

	describe('isAdmin', () => {
		it('returns "Admin" for admin user', async () => {
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: '123' }) // for userExist
				.mockResolvedValueOnce({ _id: '123', isAdmin: true });
			await expect(utils.isAdmin('123')).resolves.toBe('Admin');
		});

		it('returns "User" for non-admin user', async () => {
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: '123' })
				.mockResolvedValueOnce({ _id: '123', isAdmin: false });
			await expect(utils.isAdmin('123')).resolves.toBe('User');
		});

		it('throws if user does not exist', async () => {
			(User.findOne as jest.Mock).mockResolvedValueOnce(null);
			await expect(utils.isAdmin('missing')).rejects.toThrow(USER_NOT_EXIST);
		});

		// Edge cases
		it('handles empty user ID', async () => { // Edge case: empty user ID
			await expect(utils.isAdmin('')).rejects.toThrow();
		});

		it('handles null user ID', async () => { // Edge case: null user ID
			await expect(utils.isAdmin(null as any)).rejects.toThrow();
		});

		it('handles undefined user ID', async () => { // Edge case: undefined user ID
			await expect(utils.isAdmin(undefined as any)).rejects.toThrow();
		});

		it('handles user with undefined isAdmin field', async () => { // Edge case: user with undefined isAdmin field
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: '123' })
				.mockResolvedValueOnce({ _id: '123', isAdmin: undefined });
			await expect(utils.isAdmin('123')).resolves.toBe('User');
		});

		// Error handling
		it('handles database query error on first call', async () => { // Error handling: database query error on first call
			(User.findOne as jest.Mock).mockRejectedValueOnce(new Error('Query failed'));
			await expect(utils.isAdmin('123')).rejects.toThrow('Query failed');
		});

		it('handles database query error on second call', async () => { // Error handling: database query error on second call
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: '123' })
				.mockRejectedValueOnce(new Error('Query failed'));
			await expect(utils.isAdmin('123')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(utils.isAdmin('123')).rejects.toThrow('Database connection lost');
		});
	});

	describe('checkAdminId', () => {
		it('resolves for admin user', async () => {
			(User.findOne as jest.Mock).mockResolvedValue({ _id: 'admin' });
			(User.findById as jest.Mock).mockResolvedValue({ _id: 'admin', isAdmin: true });
			await expect(utils.checkAdminId('admin', 'targetId')).resolves.toBeUndefined();
		});

		it('resolves for same user acting on self', async () => {
			(User.findOne as jest.Mock).mockResolvedValue({ _id: 'u1' });
			(User.findById as jest.Mock).mockResolvedValue({ _id: 'u1', isAdmin: false });
			await expect(utils.checkAdminId('u1', 'u1')).resolves.toBeUndefined();
		});

		it('throws FORBIDDEN for non-admin modifying others', async () => {
			(User.findOne as jest.Mock).mockResolvedValue({ _id: 'u1' });
			(User.findById as jest.Mock).mockResolvedValue({ _id: 'u1', isAdmin: false });
			await expect(utils.checkAdminId('u1', 'u2')).rejects.toThrow(FORBIDDEN);
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			await expect(utils.checkAdminId('', 'targetId')).rejects.toThrow();
		});

		it('handles empty target ID', async () => { // Edge case: empty target ID
			await expect(utils.checkAdminId('admin', '')).rejects.toThrow();
		});

		it('handles null admin ID', async () => { // Edge case: null admin ID
			await expect(utils.checkAdminId(null as any, 'targetId')).rejects.toThrow();
		});

		it('handles null target ID', async () => { // Edge case: null target ID
			await expect(utils.checkAdminId('admin', null as any)).rejects.toThrow();
		});

		it('handles undefined admin ID', async () => { // Edge case: undefined admin ID
			await expect(utils.checkAdminId(undefined as any, 'targetId')).rejects.toThrow();
		});

		it('handles undefined target ID', async () => { // Edge case: undefined target ID
			await expect(utils.checkAdminId('admin', undefined as any)).rejects.toThrow();
		});

		// Error handling
		it('handles database query error on first call', async () => { // Error handling: database query error on first call
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(utils.checkAdminId('admin', 'targetId')).rejects.toThrow('Query failed');
		});

		it('handles database query error on second call', async () => { // Error handling: database query error on second call
			(User.findOne as jest.Mock).mockResolvedValue({ _id: 'admin' });
			(User.findById as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(utils.checkAdminId('admin', 'targetId')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(utils.checkAdminId('admin', 'targetId')).rejects.toThrow('Database connection lost');
		});
	});

	describe('checkEmailExists', () => {
		it('throws if email already exists', async () => {
			(User.findOne as jest.Mock).mockResolvedValue({ _id: 'u1', email: 'a@a.com' });
			await expect(utils.checkEmailExists('a@a.com')).rejects.toThrow(EMAIL_EXIST);
		});

		it('resolves if email does not exist', async () => {
			(User.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.checkEmailExists('new@a.com')).resolves.toBeUndefined();
		});

		// Edge cases
		it('handles empty email', async () => { // Edge case: empty email
			await expect(utils.checkEmailExists('')).rejects.toThrow();
		});

		it('handles null email', async () => { // Edge case: null email
			await expect(utils.checkEmailExists(null as any)).rejects.toThrow();
		});

		it('handles undefined email', async () => { // Edge case: undefined email
			await expect(utils.checkEmailExists(undefined as any)).rejects.toThrow();
		});

		it('handles invalid email format', async () => { // Edge case: invalid email format
			(User.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.checkEmailExists('invalid-email')).resolves.toBeUndefined();
		});

		it('handles email with special characters', async () => { // Edge case: email with special characters
			(User.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.checkEmailExists('test+tag@example.com')).resolves.toBeUndefined();
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(utils.checkEmailExists('test@example.com')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(utils.checkEmailExists('test@example.com')).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(utils.checkEmailExists('test@example.com')).rejects.toThrow('Request timeout');
		});
	});

	describe('checkUserLicensExist', () => {
		it('throws if user has any licenses', async () => {
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: 'u1' })
				.mockResolvedValueOnce({ _id: 'u1', licens: ['ABC'] });
			await expect(utils.checkUserLicensExist('u1')).rejects.toThrow(LICENS_EXIST);
		});

		it('resolves if user has no licenses', async () => {
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: 'u1' })
				.mockResolvedValueOnce({ _id: 'u1', licens: [] });
			await expect(utils.checkUserLicensExist('u1')).resolves.toBeUndefined();
		});

		// Edge cases
		it('handles empty user ID', async () => { // Edge case: empty user ID
			await expect(utils.checkUserLicensExist('')).rejects.toThrow();
		});

		it('handles null user ID', async () => { // Edge case: null user ID
			await expect(utils.checkUserLicensExist(null as any)).rejects.toThrow();
		});

		it('handles undefined user ID', async () => { // Edge case: undefined user ID
			await expect(utils.checkUserLicensExist(undefined as any)).rejects.toThrow();
		});

		it('handles user with null licens field', async () => { // Edge case: user with null licens field
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: 'u1' })
				.mockResolvedValueOnce({ _id: 'u1', licens: null });
			await expect(utils.checkUserLicensExist('u1')).resolves.toBeUndefined();
		});

		it('handles user with undefined licens field', async () => { // Edge case: user with undefined licens field
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: 'u1' })
				.mockResolvedValueOnce({ _id: 'u1' });
			await expect(utils.checkUserLicensExist('u1')).resolves.toBeUndefined();
		});

		// Error handling
		it('handles database query error on first call', async () => { // Error handling: database query error on first call
			(User.findOne as jest.Mock).mockRejectedValueOnce(new Error('Query failed'));
			await expect(utils.checkUserLicensExist('u1')).rejects.toThrow('Query failed');
		});

		it('handles database query error on second call', async () => { // Error handling: database query error on second call
			(User.findOne as jest.Mock)
				.mockResolvedValueOnce({ _id: 'u1' })
				.mockRejectedValueOnce(new Error('Query failed'));
			await expect(utils.checkUserLicensExist('u1')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(utils.checkUserLicensExist('u1')).rejects.toThrow('Database connection lost');
		});
	});

	describe('vehicleExist', () => {
		it('resolves when vehicle exists', async () => {
			(Vehicle.findOne as jest.Mock).mockResolvedValue({ _id: 'v1' });
			await expect(utils.vehicleExist('v1')).resolves.toBeUndefined();
		});

		it('throws when vehicle not found', async () => {
			(Vehicle.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.vehicleExist('missing')).rejects.toThrow(VEHICLE_NOT_EXIST);
		});

		// Edge cases
		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			await expect(utils.vehicleExist('')).rejects.toThrow();
		});

		it('handles null vehicle ID', async () => { // Edge case: null vehicle ID
			await expect(utils.vehicleExist(null as any)).rejects.toThrow();
		});

		it('handles undefined vehicle ID', async () => { // Edge case: undefined vehicle ID
			await expect(utils.vehicleExist(undefined as any)).rejects.toThrow();
		});

		it('handles vehicle ID with special characters', async () => { // Edge case: vehicle ID with special characters
			(Vehicle.findOne as jest.Mock).mockResolvedValue(null);
			await expect(utils.vehicleExist('v1@#$')).rejects.toThrow(VEHICLE_NOT_EXIST);
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Vehicle.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(utils.vehicleExist('v1')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Vehicle.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(utils.vehicleExist('v1')).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(Vehicle.findOne as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(utils.vehicleExist('v1')).rejects.toThrow('Request timeout');
		});

		it('handles validation error', async () => { // Error handling: validation error
			(Vehicle.findOne as jest.Mock).mockRejectedValue(new Error('Invalid ObjectId'));
			await expect(utils.vehicleExist('v1')).rejects.toThrow('Invalid ObjectId');
		});
	});
});
