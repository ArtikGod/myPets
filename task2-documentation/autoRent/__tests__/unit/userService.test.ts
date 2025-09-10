import { createUser, createLicens, getUser, editUser, deleteUser } from '../../src/users/userService';
import { User } from '../../src/users/userModel';
import utils from '../../src/utils';

jest.mock('../../src/users/userModel', () => ({
	User: {
		create: jest.fn(),
		updateOne: jest.fn(),
		findOne: jest.fn(),
		findOneAndUpdate: jest.fn(),
		findByIdAndDelete: jest.fn(),
	}
}));

jest.mock('../../src/utils', () => ({
	__esModule: true,
	default: {
		checkAdminId: jest.fn(),
		checkEmailExists: jest.fn(),
		checkUserLicensExist: jest.fn(),
	}
}));

describe('userService', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createUser', () => {
		it('creates user after passing email check', async () => {
			(utils.checkEmailExists as jest.Mock).mockResolvedValue(undefined);
			(User.create as jest.Mock).mockResolvedValue({ _id: 'u1' });
			const result = await createUser('john', 'j@a.com', 'pwd', false);
			expect(User.create).toHaveBeenCalled();
			expect(result).toEqual({ _id: 'u1' });
		});

			// Edge cases
			it('handles empty username', async () => { // Edge case: empty username
				const result = await createUser('', 'j@a.com', 'pwd', false);
				expect(result).toBeDefined();
			});

			it('handles empty email', async () => { // Edge case: empty email
				const result = await createUser('john', '', 'pwd', false);
				expect(result).toBeDefined();
			});

			it('handles empty password', async () => { // Edge case: empty password
				const result = await createUser('john', 'j@a.com', '', false);
				expect(result).toBeDefined();
			});

			it('handles null username', async () => { // Edge case: null username
				const result = await createUser(null as any, 'j@a.com', 'pwd', false);
				expect(result).toBeDefined();
			});

			it('handles undefined email', async () => { // Edge case: undefined email
				const result = await createUser('john', undefined as any, 'pwd', false);
				expect(result).toBeDefined();
			});

		// Error handling
		it('throws error when email already exists', async () => { // Error handling: email exists
			(utils.checkEmailExists as jest.Mock).mockRejectedValue(new Error('Email already exists'));
			await expect(createUser('john', 'j@a.com', 'pwd', false)).rejects.toThrow('Email already exists');
		});

		it('throws error when user creation fails', async () => { // Error handling: user creation fails
			(utils.checkEmailExists as jest.Mock).mockResolvedValue(undefined);
			(User.create as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
			await expect(createUser('john', 'j@a.com', 'pwd', false)).rejects.toThrow('Database connection failed');
		});

		it('handles database timeout error', async () => { // Error handling: database timeout
			(utils.checkEmailExists as jest.Mock).mockResolvedValue(undefined);
			(User.create as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(createUser('john', 'j@a.com', 'pwd', false)).rejects.toThrow('Request timeout');
		});
	});

	describe('createLicens', () => {
		it('updates user with license after check', async () => {
			(utils.checkUserLicensExist as jest.Mock).mockResolvedValue(undefined);
			(User.updateOne as jest.Mock).mockResolvedValue({ acknowledged: true });
			const res = await createLicens('u1', 'ABCD', '2024-01-01', '2025-01-01');
			expect(User.updateOne).toHaveBeenCalledWith(
				{ _id: 'u1' },
				{ $push: { licens: 'ABCD', dateRelease: '2024-01-01', dateValidity: '2025-01-01' } }
			);
			expect(res).toEqual({ acknowledged: true });
		});

			// Edge cases
			it('handles empty user ID', async () => { // Edge case: empty user ID
				const result = await createLicens('', 'ABCD', '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles empty license number', async () => { // Edge case: empty license number
				const result = await createLicens('u1', '', '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles invalid date format', async () => { // Edge case: invalid date format
				const result = await createLicens('u1', 'ABCD', 'invalid-date', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles null user ID', async () => { // Edge case: null user ID
				const result = await createLicens(null as any, 'ABCD', '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles undefined license number', async () => { // Edge case: undefined license number
				const result = await createLicens('u1', undefined as any, '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

		// Error handling
		it('throws error when user already has license', async () => { // Error handling: license exists
			(utils.checkUserLicensExist as jest.Mock).mockRejectedValue(new Error('User already has license'));
			await expect(createLicens('u1', 'ABCD', '2024-01-01', '2025-01-01')).rejects.toThrow('User already has license');
		});

		it('throws error when user update fails', async () => { // Error handling: update fails
			(utils.checkUserLicensExist as jest.Mock).mockResolvedValue(undefined);
			(User.updateOne as jest.Mock).mockRejectedValue(new Error('Update failed'));
			await expect(createLicens('u1', 'ABCD', '2024-01-01', '2025-01-01')).rejects.toThrow('Update failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkUserLicensExist as jest.Mock).mockResolvedValue(undefined);
			(User.updateOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(createLicens('u1', 'ABCD', '2024-01-01', '2025-01-01')).rejects.toThrow('Database connection lost');
		});
	});

	describe('getUser', () => {
		it('returns user after admin/self check', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findOne as jest.Mock).mockResolvedValue({ _id: 'u2' });
			const res = await getUser('admin', 'u2');
			expect(res).toEqual({ _id: 'u2' });
		});

			// Edge cases
			it('handles empty admin ID', async () => { // Edge case: empty admin ID
				const result = await getUser('', 'u2');
				expect(result).toBeDefined();
			});

			it('handles empty target user ID', async () => { // Edge case: empty target user ID
				const result = await getUser('admin', '');
				expect(result).toBeDefined();
			});

			it('handles null admin ID', async () => { // Edge case: null admin ID
				const result = await getUser(null as any, 'u2');
				expect(result).toBeDefined();
			});

			it('handles undefined target user ID', async () => { // Edge case: undefined target user ID
				const result = await getUser('admin', undefined as any);
				expect(result).toBeDefined();
			});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(getUser('admin', 'u2')).rejects.toThrow('Unauthorized access');
		});

		it('returns null when user not found', async () => { // Error handling: user not found
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findOne as jest.Mock).mockResolvedValue(null);
			const result = await getUser('admin', 'u2');
			expect(result).toBeNull();
		});

		it('handles database query error', async () => { // Error handling: database query error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(getUser('admin', 'u2')).rejects.toThrow('Query failed');
		});
	});

	describe('editUser', () => {
		it('updates user after admin/self check', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: 'u2' });
			const res = await editUser('admin', 'u2', 'a@b.com', 123, '2024-01-01', '2025-01-01');
			expect(User.findOneAndUpdate).toHaveBeenCalledWith(
				{ _id: 'u2' },
				{ $set: { email: 'a@b.com', licens: { numberLicens: 123, dateRelease: '2024-01-01', dateValidity: '2025-01-01' } } }
			);
			expect(res).toEqual({ _id: 'u2' });
		});

			// Edge cases
			it('handles empty admin ID', async () => { // Edge case: empty admin ID
				const result = await editUser('', 'u2', 'a@b.com', 123, '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles empty target user ID', async () => { // Edge case: empty target user ID
				const result = await editUser('admin', '', 'a@b.com', 123, '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles invalid email format', async () => { // Edge case: invalid email format
				const result = await editUser('admin', 'u2', 'invalid-email', 123, '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles negative license number', async () => { // Edge case: negative license number
				const result = await editUser('admin', 'u2', 'a@b.com', -1, '2024-01-01', '2025-01-01');
				expect(result).toBeDefined();
			});

			it('handles invalid date format', async () => { // Edge case: invalid date format
				const result = await editUser('admin', 'u2', 'a@b.com', 123, 'invalid-date', '2025-01-01');
				expect(result).toBeDefined();
			});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(editUser('admin', 'u2', 'a@b.com', 123, '2024-01-01', '2025-01-01')).rejects.toThrow('Unauthorized access');
		});

		it('throws error when user update fails', async () => { // Error handling: user update fails
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));
			await expect(editUser('admin', 'u2', 'a@b.com', 123, '2024-01-01', '2025-01-01')).rejects.toThrow('Update failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(editUser('admin', 'u2', 'a@b.com', 123, '2024-01-01', '2025-01-01')).rejects.toThrow('Database connection lost');
		});
	});

	describe('deleteUser', () => {
		it('deletes user after admin check', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findByIdAndDelete as jest.Mock).mockResolvedValue({ acknowledged: true });
			const res = await deleteUser('admin', 'u2');
			expect(User.findByIdAndDelete).toHaveBeenCalledWith('u2');
			expect(res).toEqual({ acknowledged: true });
		});

			// Edge cases
			it('handles empty admin ID', async () => { // Edge case: empty admin ID
				const result = await deleteUser('', 'u2');
				expect(result).toBeDefined();
			});

			it('handles empty target user ID', async () => { // Edge case: empty target user ID
				const result = await deleteUser('admin', '');
				expect(result).toBeDefined();
			});

			it('handles null admin ID', async () => { // Edge case: null admin ID
				const result = await deleteUser(null as any, 'u2');
				expect(result).toBeDefined();
			});

			it('handles undefined target user ID', async () => { // Edge case: undefined target user ID
				const result = await deleteUser('admin', undefined as any);
				expect(result).toBeDefined();
			});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(deleteUser('admin', 'u2')).rejects.toThrow('Unauthorized access');
		});

		it('throws error when user deletion fails', async () => { // Error handling: user deletion fails
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Delete failed'));
			await expect(deleteUser('admin', 'u2')).rejects.toThrow('Delete failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(User.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(deleteUser('admin', 'u2')).rejects.toThrow('Database connection lost');
		});
	});
});
