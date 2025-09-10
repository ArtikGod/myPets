import {
	createVehicle,
	getVehicleData,
	getVehicleSort,
	newVehicleData,
	deleteVehicle,
	getVehicleFree,
	getAllVehicles,
} from '../../src/vehicle/vehicleService';

import { Vehicle } from '../../src/vehicle/vehicleModel';
import utils from '../../src/utils';

jest.mock('../../src/vehicle/vehicleModel', () => ({
	Vehicle: {
		create: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		findOneAndUpdate: jest.fn(),
		findOneAndDelete: jest.fn(),
	}
}));

jest.mock('../../src/utils', () => ({
	__esModule: true,
	default: {
		userExist: jest.fn(),
		checkAdminId: jest.fn(),
		vehicleExist: jest.fn(),
	}
}));

jest.mock('../../src/reservations/reservationsService', () => ({
	getReservationsVehicleAvailable: jest.fn(),
	showVehiclesAvaibleReservation: jest.fn(),
}));

import { getReservationsVehicleAvailable } from '../../src/reservations/reservationsService';

describe('vehicleService', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('createVehicle', () => {
		it('creates when admin', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.create as jest.Mock).mockResolvedValue({ _id: 'v1' });
			const result = await createVehicle('admin', 'Make', 'Model', 2020, 100, 'url');
			expect(Vehicle.create).toHaveBeenCalled();
			expect(result).toEqual({ _id: 'v1' });
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			await expect(createVehicle('', 'Make', 'Model', 2020, 100, 'url')).rejects.toThrow();
		});

		it('handles empty make', async () => { // Edge case: empty make
			await expect(createVehicle('admin', '', 'Model', 2020, 100, 'url')).rejects.toThrow();
		});

		it('handles empty model', async () => { // Edge case: empty model
			await expect(createVehicle('admin', 'Make', '', 2020, 100, 'url')).rejects.toThrow();
		});

		it('handles negative year', async () => { // Edge case: negative year
			await expect(createVehicle('admin', 'Make', 'Model', -1, 100, 'url')).rejects.toThrow();
		});

		it('handles negative price', async () => { // Edge case: negative price
			await expect(createVehicle('admin', 'Make', 'Model', 2020, -100, 'url')).rejects.toThrow();
		});

		it('handles empty photo URL', async () => { // Edge case: empty photo URL
			await expect(createVehicle('admin', 'Make', 'Model', 2020, 100, '')).rejects.toThrow();
		});

		it('handles undefined admin ID', async () => { // Edge case: null admin ID
			await expect(createVehicle(undefined, 'Make', 'Model', 2020, 100, 'url')).rejects.toThrow();
		});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(createVehicle('admin', 'Make', 'Model', 2020, 100, 'url')).rejects.toThrow('Unauthorized access');
		});

		it('throws error when vehicle creation fails', async () => { // Error handling: vehicle creation fails
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.create as jest.Mock).mockRejectedValue(new Error('Database connection failed'));
			await expect(createVehicle('admin', 'Make', 'Model', 2020, 100, 'url')).rejects.toThrow('Database connection failed');
		});

		it('handles database timeout error', async () => { // Error handling: database timeout
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.create as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(createVehicle('admin', 'Make', 'Model', 2020, 100, 'url')).rejects.toThrow('Request timeout');
		});
	});

	describe('getVehicleData', () => {
		it('returns data when user and vehicle exist', async () => {
			(utils.userExist as jest.Mock).mockResolvedValue(undefined);
			(utils.vehicleExist as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.find as jest.Mock).mockResolvedValue([{ _id: 'v1' }]);
			const result = await getVehicleData('u1', 'v1');
			expect(result).toEqual([{ _id: 'v1' }]);
		});

		// Edge cases
		it('handles empty user ID', async () => { // Edge case: empty user ID
			await expect(getVehicleData('', 'v1')).rejects.toThrow();
		});

		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			await expect(getVehicleData('u1', '')).rejects.toThrow();
		});

		it('handles null user ID', async () => { // Edge case: null user ID
			await expect(getVehicleData(null as any, 'v1')).rejects.toThrow();
		});

		it('handles undefined vehicle ID', async () => { // Edge case: undefined vehicle ID
			await expect(getVehicleData('u1', undefined as any)).rejects.toThrow();
		});

		it('handles invalid vehicle ID format', async () => { // Edge case: invalid vehicle ID format
			(utils.userExist as jest.Mock).mockResolvedValue(undefined);
			(utils.vehicleExist as jest.Mock).mockResolvedValue(undefined);
			await expect(getVehicleData('u1', 'invalid-id')).rejects.toThrow();
		});

		// Error handling
		it('throws error when user does not exist', async () => { // Error handling: user not found
			(utils.userExist as jest.Mock).mockRejectedValue(new Error('User not found'));
			await expect(getVehicleData('u1', 'v1')).rejects.toThrow('User not found');
		});

		it('throws error when vehicle does not exist', async () => { // Error handling: vehicle not found
			(utils.userExist as jest.Mock).mockResolvedValue(undefined);
			(utils.vehicleExist as jest.Mock).mockRejectedValue(new Error('Vehicle not found'));
			await expect(getVehicleData('u1', 'v1')).rejects.toThrow('Vehicle not found');
		});

		it('handles database query error', async () => { // Error handling: database query error
			(utils.userExist as jest.Mock).mockResolvedValue(undefined);
			(utils.vehicleExist as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(getVehicleData('u1', 'v1')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.userExist as jest.Mock).mockResolvedValue(undefined);
			(utils.vehicleExist as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(getVehicleData('u1', 'v1')).rejects.toThrow('Database connection lost');
		});
	});

	describe('getVehicleSort', () => {
		it('applies sort by price asc and min/max filters', async () => {
			const sortMock = jest.fn().mockResolvedValue(['sorted']);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort('price', 'asc', 10, 100, undefined, undefined);
			expect(Vehicle.find).toHaveBeenCalledWith({ price: { $gte: 10, $lte: 100 } });
			expect(sortMock).toHaveBeenCalledWith({ price: 1 });
			expect(result).toEqual(['sorted']);
		});

		it('applies year range and desc sort when no sort_by', async () => {
			const sortMock = jest.fn().mockResolvedValue(['res']);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort(undefined, 'desc', undefined, undefined, 2010, 2020);
			expect(Vehicle.find).toHaveBeenCalledWith({ year: { $gte: 2010, $lte: 2020 } });
			expect(sortMock).toHaveBeenCalledWith({});
			expect(result).toEqual(['res']);
		});

		// Edge cases
		it('handles invalid sort field', async () => { // Edge case: invalid sort field
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort('invalid', 'asc', 10, 100, undefined, undefined);
			expect(result).toEqual([]);
		});

		it('handles invalid sort order', async () => { // Edge case: invalid sort order
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort('price', 'invalid', 10, 100, undefined, undefined);
			expect(result).toEqual([]);
		});

		it('handles negative min price', async () => { // Edge case: negative min price
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort('price', 'asc', -10, 100, undefined, undefined);
			expect(result).toEqual([]);
		});

		it('handles min price greater than max price', async () => { // Edge case: min > max price
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort('price', 'asc', 200, 100, undefined, undefined);
			expect(result).toEqual([]);
		});

		it('handles negative year range', async () => { // Edge case: negative year range
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort(undefined, 'asc', undefined, undefined, -2020, 2010);
			expect(result).toEqual([]);
		});

		it('handles min year greater than max year', async () => { // Edge case: min year > max year
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort(undefined, 'asc', undefined, undefined, 2025, 2000);
			expect(result).toEqual([]);
		});

		it('handles empty filters', async () => { // Edge case: empty filters
			const sortMock = jest.fn().mockResolvedValue([]);
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			const result = await getVehicleSort(undefined, undefined, undefined, undefined, undefined, undefined);
			expect(result).toEqual([]);
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Vehicle.find as jest.Mock).mockImplementation(() => {
				throw new Error('Query failed');
			});
			await expect(getVehicleSort('price', 'asc', 10, 100, undefined, undefined)).rejects.toThrow('Query failed');
		});

		it('handles sort operation error', async () => { // Error handling: sort operation error
			const sortMock = jest.fn().mockImplementation(() => {
				throw new Error('Sort failed');
			});
			(Vehicle.find as jest.Mock).mockReturnValue({ sort: sortMock });
			await expect(getVehicleSort('price', 'asc', 10, 100, undefined, undefined)).rejects.toThrow('Sort failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Vehicle.find as jest.Mock).mockImplementation(() => {
				throw new Error('Database connection lost');
			});
			await expect(getVehicleSort('price', 'asc', 10, 100, undefined, undefined)).rejects.toThrow('Database connection lost');
		});
	});

	describe('newVehicleData', () => {
		it('updates vehicle after admin check', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: 'v1' });
			const result = await newVehicleData('admin', 'v1', 'Make', 'Model', 2021, 200, 'url');
			expect(result).toEqual({ _id: 'v1' });
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			await expect(newVehicleData('', 'v1', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow();
		});

		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			await expect(newVehicleData('admin', '', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow();
		});

		it('handles empty make', async () => { // Edge case: empty make
			await expect(newVehicleData('admin', 'v1', '', 'Model', 2021, 200, 'url')).rejects.toThrow();
		});

		it('handles empty model', async () => { // Edge case: empty model
			await expect(newVehicleData('admin', 'v1', 'Make', '', 2021, 200, 'url')).rejects.toThrow();
		});

		it('handles negative year', async () => { // Edge case: negative year
			await expect(newVehicleData('admin', 'v1', 'Make', 'Model', -1, 200, 'url')).rejects.toThrow();
		});

		it('handles negative price', async () => { // Edge case: negative price
			await expect(newVehicleData('admin', 'v1', 'Make', 'Model', 2021, -200, 'url')).rejects.toThrow();
		});

		it('handles undefined admin ID', async () => { // Edge case: null admin ID
			await expect(newVehicleData(undefined, 'v1', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow();
		});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(newVehicleData('admin', 'v1', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow('Unauthorized access');
		});

		it('throws error when vehicle update fails', async () => { // Error handling: vehicle update fails
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));
			await expect(newVehicleData('admin', 'v1', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow('Update failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(newVehicleData('admin', 'v1', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow('Database connection lost');
		});

		it('handles vehicle not found error', async () => { // Error handling: vehicle not found
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
			await expect(newVehicleData('admin', 'v1', 'Make', 'Model', 2021, 200, 'url')).rejects.toThrow('Vehicle not found');
		});
	});

	describe('deleteVehicle', () => {
		it('deletes vehicle after admin check', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndDelete as jest.Mock).mockResolvedValue({ acknowledged: true });
			const result = await deleteVehicle('admin', 'v1');
			expect(result).toEqual({ acknowledged: true });
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			await expect(deleteVehicle('', 'v1')).rejects.toThrow();
		});

		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			await expect(deleteVehicle('admin', '')).rejects.toThrow();
		});

		it('handles null admin ID', async () => { // Edge case: null admin ID
			await expect(deleteVehicle(null as any, 'v1')).rejects.toThrow();
		});

		it('handles undefined vehicle ID', async () => { // Edge case: undefined vehicle ID
			await expect(deleteVehicle('admin', undefined as any)).rejects.toThrow();
		});

		it('handles invalid vehicle ID format', async () => { // Edge case: invalid vehicle ID format
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndDelete as jest.Mock).mockResolvedValue(null);
			await expect(deleteVehicle('admin', 'invalid-id')).rejects.toThrow('Invalid vehicle ID');
		});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(deleteVehicle('admin', 'v1')).rejects.toThrow('Unauthorized access');
		});

		it('throws error when vehicle deletion fails', async () => { // Error handling: vehicle deletion fails
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Delete failed'));
			await expect(deleteVehicle('admin', 'v1')).rejects.toThrow('Delete failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndDelete as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(deleteVehicle('admin', 'v1')).rejects.toThrow('Database connection lost');
		});

		it('handles vehicle not found error', async () => { // Error handling: vehicle not found
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Vehicle.findOneAndDelete as jest.Mock).mockResolvedValue(null);
			await expect(deleteVehicle('admin', 'v1')).rejects.toThrow('Vehicle not found');
		});
	});

	describe('getVehicleFree', () => {
		it('returns formatted list of available vehicles', async () => {
			(Vehicle.find as jest.Mock).mockResolvedValue([
				{ _id: 'v1', make: 'A', model: 'B' },
				{ _id: 'v2', make: 'C', model: 'D' },
			]);
			(getReservationsVehicleAvailable as jest.Mock)
				.mockResolvedValueOnce(true)
				.mockResolvedValueOnce(false);
			const text = await getVehicleFree('2024-01-01', '2024-01-02');
			expect(text).toBe('1. A B');
		});

		// Edge cases
		it('handles empty start date', async () => { // Edge case: empty start date
			await expect(getVehicleFree('', '2024-01-02')).rejects.toThrow();
		});

		it('handles empty end date', async () => { // Edge case: empty end date
			await expect(getVehicleFree('2024-01-01', '')).rejects.toThrow();
		});

		it('handles invalid date format', async () => { // Edge case: invalid date format
			await expect(getVehicleFree('invalid-date', '2024-01-02')).rejects.toThrow();
		});

		it('handles start date after end date', async () => { // Edge case: start date after end date
			await expect(getVehicleFree('2024-01-02', '2024-01-01')).rejects.toThrow();
		});

		it('handles null dates', async () => { // Edge case: null dates
			await expect(getVehicleFree(null as any, null as any)).rejects.toThrow();
		});

		it('handles no vehicles available', async () => { // Edge case: no vehicles available
			(Vehicle.find as jest.Mock).mockResolvedValue([]);
			const text = await getVehicleFree('2024-01-01', '2024-01-02');
			expect(text).toBe('');
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(getVehicleFree('2024-01-01', '2024-01-02')).rejects.toThrow('Query failed');
		});

		it('handles reservation check error', async () => { // Error handling: reservation check error
			(Vehicle.find as jest.Mock).mockResolvedValue([{ _id: 'v1', make: 'A', model: 'B' }]);
			(getReservationsVehicleAvailable as jest.Mock).mockRejectedValue(new Error('Reservation check failed'));
			await expect(getVehicleFree('2024-01-01', '2024-01-02')).rejects.toThrow('Reservation check failed');
		});

		it('handles empty vehicle list', async () => { // Error handling: empty vehicle list
			(Vehicle.find as jest.Mock).mockResolvedValue([]);
			const result = await getVehicleFree('2024-01-01', '2024-01-02');
			expect(result).toBe('');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(getVehicleFree('2024-01-01', '2024-01-02')).rejects.toThrow('Database connection lost');
		});
	});

	describe('getAllVehicles', () => {
		it('returns make|model list', async () => {
			(Vehicle.find as jest.Mock).mockResolvedValue([
				{ make: 'A', model: 'B' },
				{ make: 'C', model: 'D' },
			]);
			const res = await getAllVehicles();
			expect(res).toEqual(['A|B', 'C|D']);
		});

		// Edge cases
		it('handles empty vehicle list', async () => { // Edge case: empty vehicle list
			(Vehicle.find as jest.Mock).mockResolvedValue([]);
			const res = await getAllVehicles();
			expect(res).toEqual([]);
		});

		it('handles vehicles with missing make', async () => { // Edge case: missing make
			(Vehicle.find as jest.Mock).mockResolvedValue([
				{ make: '', model: 'B' },
				{ make: 'C', model: 'D' },
			]);
			const res = await getAllVehicles();
			expect(res).toEqual(['|B', 'C|D']);
		});

		it('handles vehicles with missing model', async () => { // Edge case: missing model
			(Vehicle.find as jest.Mock).mockResolvedValue([
				{ make: 'A', model: '' },
				{ make: 'C', model: 'D' },
			]);
			const res = await getAllVehicles();
			expect(res).toEqual(['A|', 'C|D']);
		});

		it('handles vehicles with null make', async () => { // Edge case: null make
			(Vehicle.find as jest.Mock).mockResolvedValue([
				{ make: null, model: 'B' },
				{ make: 'C', model: 'D' },
			]);
			const res = await getAllVehicles();
			expect(res).toEqual(['null|B', 'C|D']);
		});

		it('handles vehicles with undefined model', async () => { // Edge case: undefined model
			(Vehicle.find as jest.Mock).mockResolvedValue([
				{ make: 'A', model: undefined },
				{ make: 'C', model: 'D' },
			]);
			const res = await getAllVehicles();
			expect(res).toEqual(['A|undefined', 'C|D']);
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(getAllVehicles()).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(getAllVehicles()).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(Vehicle.find as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(getAllVehicles()).rejects.toThrow('Request timeout');
		});
	});
});