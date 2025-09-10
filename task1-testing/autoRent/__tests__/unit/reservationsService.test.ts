import * as reservationsService from '../../src/reservations/reservationsService';

import { Reservations } from '../../src/reservations/reservationsModel';
import utils from '../../src/utils';
import { VEHICLE_RESERVED_DATE, FORBIDDEN_USER, CANCEL_DAY } from '../../src/constants';

jest.mock('../../src/reservations/reservationsModel', () => ({
	Reservations: {
		create: jest.fn(),
		find: jest.fn(),
		findOne: jest.fn(),
		aggregate: jest.fn(),
		findById: jest.fn(),
		findByIdAndUpdate: jest.fn(),
	}
}));

jest.mock('../../src/utils', () => ({
	__esModule: true,
	default: {
		isAdmin: jest.fn(),
		checkAdminId: jest.fn(),
	}
}));

describe('reservationsService', () => {
	afterEach(() => {
		jest.resetAllMocks();
	});

	describe('getReservationsVehicleAvailable', () => {
		it('returns false when overlapping reservation exists', async () => {
			(Reservations.findOne as jest.Mock).mockResolvedValue({ _id: 'r1' });
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date(), new Date())).resolves.toBe(false);
		});

		it('returns true when no overlapping reservation exists', async () => {
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date(), new Date())).resolves.toBe(true);
		});

		// Edge cases
		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.getReservationsVehicleAvailable('', new Date(), new Date())).resolves.toBe(true);
		});

		it('handles null vehicle ID', async () => { // Edge case: null vehicle ID
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.getReservationsVehicleAvailable(null as any, new Date(), new Date())).resolves.toBe(true);
		});

		it('handles invalid start date', async () => { // Edge case: invalid start date
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date('invalid'), new Date())).resolves.toBe(true);
		});

		it('handles invalid end date', async () => { // Edge case: invalid end date
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date(), new Date('invalid'))).resolves.toBe(true);
		});

		it('handles start date after end date', async () => { // Edge case: start date after end date
			const future = new Date(Date.now() + 24*3600*1000);
			const past = new Date(Date.now() - 24*3600*1000);
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.getReservationsVehicleAvailable('v1', future, past)).resolves.toBe(true);
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Reservations.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date(), new Date())).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Reservations.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date(), new Date())).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(Reservations.findOne as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(reservationsService.getReservationsVehicleAvailable('v1', new Date(), new Date())).rejects.toThrow('Request timeout');
		});
	});

	describe('createReservations', () => {
		it('creates reservation when date available', async () => {
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations('v1','u1', new Date(), new Date(), 100, 'Done');
			expect(Reservations.create).toHaveBeenCalled();
			expect(result).toEqual({ _id: 'r1' });
		});

		it('throws when date not available', async () => {
			(Reservations.findOne as jest.Mock).mockResolvedValue({ _id: 'conflict' });
			await expect(reservationsService.createReservations('v1','u1', new Date(), new Date(), 100, 'Done')).rejects.toThrow(VEHICLE_RESERVED_DATE);
		});

		// Edge cases
		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations('','u1', new Date(), new Date(), 100, 'Done');
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles empty user ID', async () => { // Edge case: empty user ID
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations('v1','', new Date(), new Date(), 100, 'Done');
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles null vehicle ID', async () => { // Edge case: null vehicle ID
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations(null as any,'u1', new Date(), new Date(), 100, 'Done');
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles null user ID', async () => { // Edge case: null user ID
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations('v1',null as any, new Date(), new Date(), 100, 'Done');
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles negative price', async () => { // Edge case: negative price
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations('v1','u1', new Date(), new Date(), -100, 'Done');
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles empty status', async () => { // Edge case: empty status
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservations('v1','u1', new Date(), new Date(), 100, '');
			expect(result).toEqual({ _id: 'r1' });
		});

		// Error handling
		it('handles database creation error', async () => { // Error handling: database creation error
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
			await expect(reservationsService.createReservations('v1','u1', new Date(), new Date(), 100, 'Done')).rejects.toThrow('Creation failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockResolvedValue(true);
			(Reservations.create as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.createReservations('v1','u1', new Date(), new Date(), 100, 'Done')).rejects.toThrow('Database connection lost');
		});

		it('handles availability check error', async () => { // Error handling: availability check error
			jest.spyOn(reservationsService, 'getReservationsVehicleAvailable').mockRejectedValue(new Error('Availability check failed'));
			const result = await reservationsService.createReservations('v1','u1', new Date(), new Date(), 100, 'Done');
			expect(result).toBeUndefined();
		});
	});

	describe('createReservationsTG', () => {
		it('returns created reservation when available', async () => {
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', 200, 10);
			expect(result).toEqual({ _id: 'r1' });
		});

		it('returns VEHICLE_RESERVED_DATE string when not available', async () => {
			(Reservations.findOne as jest.Mock).mockResolvedValue({ _id: 'conflict' });
			const result = await reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', 200, 10);
			expect(result).toBe(VEHICLE_RESERVED_DATE);
		});

		// Edge cases
		it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('', '2024-01-01', '2024-01-02', 200, 10);
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles empty start date', async () => { // Edge case: empty start date
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('v1', '', '2024-01-02', 200, 10);
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles empty end date', async () => { // Edge case: empty end date
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('v1', '2024-01-01', '', 200, 10);
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles invalid date format', async () => { // Edge case: invalid date format
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('v1', 'invalid-date', '2024-01-02', 200, 10);
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles negative price', async () => { // Edge case: negative price
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', -200, 10);
			expect(result).toEqual({ _id: 'r1' });
		});

		it('handles negative user ID', async () => { // Edge case: negative user ID
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', 200, -10);
			expect(result).toEqual({ _id: 'r1' });
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Reservations.findOne as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', 200, 10)).rejects.toThrow('Query failed');
		});

		it('handles database creation error', async () => { // Error handling: database creation error
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.create as jest.Mock).mockRejectedValue(new Error('Creation failed'));
			await expect(reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', 200, 10)).rejects.toThrow('Creation failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Reservations.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.createReservationsTG('v1', '2024-01-01', '2024-01-02', 200, 10)).rejects.toThrow('Database connection lost');
		});
	});

	describe('showVehiclesAvaibleReservation', () => {
		it('throws when conflict reservations exist', async () => {
			(Reservations.find as jest.Mock).mockResolvedValue([ { _id: 'r1' } ]);
			await expect(reservationsService.showVehiclesAvaibleReservation(new Date(), new Date())).rejects.toThrow(VEHICLE_RESERVED_DATE);
		});

		it('returns reservations when no conflicts', async () => {
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			await expect(reservationsService.showVehiclesAvaibleReservation(new Date(), new Date())).resolves.toEqual([]);
		});

		// Edge cases
		it('handles invalid start date', async () => { // Edge case: invalid start date
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.showVehiclesAvaibleReservation(new Date('invalid'), new Date());
			expect(result).toEqual([]);
		});

		it('handles invalid end date', async () => { // Edge case: invalid end date
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.showVehiclesAvaibleReservation(new Date(), new Date('invalid'));
			expect(result).toEqual([]);
		});

		it('handles start date after end date', async () => { // Edge case: start date after end date
			const future = new Date(Date.now() + 24*3600*1000);
			const past = new Date(Date.now() - 24*3600*1000);
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.showVehiclesAvaibleReservation(future, past);
			expect(result).toEqual([]);
		});

		it('handles null dates', async () => { // Edge case: null dates
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.showVehiclesAvaibleReservation(null as any, null as any);
			expect(result).toEqual([]);
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Reservations.find as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(reservationsService.showVehiclesAvaibleReservation(new Date(), new Date())).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Reservations.find as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.showVehiclesAvaibleReservation(new Date(), new Date())).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(Reservations.find as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(reservationsService.showVehiclesAvaibleReservation(new Date(), new Date())).rejects.toThrow('Request timeout');
		});
	});

	describe('getReservationsHistory', () => {
		it('returns list by userId', async () => {
			(Reservations.find as jest.Mock).mockResolvedValue([{ _id: 'r1', userId: 'u1' }]);
			await expect(reservationsService.getReservationsHistory('u1')).resolves.toEqual([{ _id: 'r1', userId: 'u1' }]);
		});

		// Edge cases
		it('handles empty user ID', async () => { // Edge case: empty user ID
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.getReservationsHistory('');
			expect(result).toEqual([]);
		});

		it('handles null user ID', async () => { // Edge case: null user ID
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.getReservationsHistory(null as any);
			expect(result).toEqual([]);
		});

		it('handles undefined user ID', async () => { // Edge case: undefined user ID
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.getReservationsHistory(undefined as any);
			expect(result).toEqual([]);
		});

		it('handles empty result list', async () => { // Edge case: empty result list
			(Reservations.find as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.getReservationsHistory('u1');
			expect(result).toEqual([]);
		});

		// Error handling
		it('handles database query error', async () => { // Error handling: database query error
			(Reservations.find as jest.Mock).mockRejectedValue(new Error('Query failed'));
			await expect(reservationsService.getReservationsHistory('u1')).rejects.toThrow('Query failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(Reservations.find as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.getReservationsHistory('u1')).rejects.toThrow('Database connection lost');
		});

		it('handles timeout error', async () => { // Error handling: timeout error
			(Reservations.find as jest.Mock).mockRejectedValue(new Error('Request timeout'));
			await expect(reservationsService.getReservationsHistory('u1')).rejects.toThrow('Request timeout');
		});
	});

	describe('getStatisticComletedReservations', () => {
		it('returns formatted statistics when authorized', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockResolvedValue([
				{ vehicleInfo: { model: 'X', year: 2022 }, count: 3 },
			]);
			const result = await reservationsService.getStatisticComletedReservations('admin');
			expect(result).toEqual(['X - 2022: 3,']);
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.getStatisticComletedReservations('')).rejects.toThrow('Unauthorized');
		});

		it('handles null admin ID', async () => { // Edge case: null admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.getStatisticComletedReservations(null as any)).rejects.toThrow('Unauthorized');
		});

		it('handles undefined admin ID', async () => { // Edge case: undefined admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.getStatisticComletedReservations(undefined as any)).rejects.toThrow('Unauthorized');
		});

		it('handles empty statistics result', async () => { // Edge case: empty statistics result
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.getStatisticComletedReservations('admin');
			expect(result).toEqual([]);
		});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(reservationsService.getStatisticComletedReservations('admin')).rejects.toThrow('Unauthorized access');
		});

		it('handles database aggregate error', async () => { // Error handling: database aggregate error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockRejectedValue(new Error('Aggregate failed'));
			await expect(reservationsService.getStatisticComletedReservations('admin')).rejects.toThrow('Aggregate failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.getStatisticComletedReservations('admin')).rejects.toThrow('Database connection lost');
		});
	});

	describe('getStatisticUsers', () => {
		it('returns formatted users statistics when authorized', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockResolvedValue([
				{ username: 'John', isAdmin: false, count: 2 },
			]);
			const result = await reservationsService.getStatisticUsers('admin');
			expect(result).toEqual(['User Name: John, is Admin: false, Count reservations: 2']);
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.getStatisticUsers('')).rejects.toThrow('Unauthorized');
		});

		it('handles null admin ID', async () => { // Edge case: null admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.getStatisticUsers(null as any)).rejects.toThrow('Unauthorized');
		});

		it('handles undefined admin ID', async () => { // Edge case: undefined admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.getStatisticUsers(undefined as any)).rejects.toThrow('Unauthorized');
		});

		it('handles empty statistics result', async () => { // Edge case: empty statistics result
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockResolvedValue([]);
			const result = await reservationsService.getStatisticUsers('admin');
			expect(result).toEqual([]);
		});

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(reservationsService.getStatisticUsers('admin')).rejects.toThrow('Unauthorized access');
		});

		it('handles database aggregate error', async () => { // Error handling: database aggregate error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockRejectedValue(new Error('Aggregate failed'));
			await expect(reservationsService.getStatisticUsers('admin')).rejects.toThrow('Aggregate failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.aggregate as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.getStatisticUsers('admin')).rejects.toThrow('Database connection lost');
		});
	});

	describe('updateReservations', () => {
		it('updates reservation after admin check when dates free', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.updateReservations('admin', 'r1', 'v1', new Date(), new Date(), 'Done');
			expect(Reservations.findByIdAndUpdate).toHaveBeenCalled();
			expect(result).toEqual({ _id: 'r1' });
		});

		it('throws when dates are not free', async () => {
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.findOne as jest.Mock).mockResolvedValue({ _id: 'conflict' });
			await expect(reservationsService.updateReservations('admin', 'r1', 'v1', new Date(), new Date(), 'Done')).rejects.toThrow(VEHICLE_RESERVED_DATE);
		});

		// Edge cases
		it('handles empty admin ID', async () => { // Edge case: empty admin ID
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized'));
			await expect(reservationsService.updateReservations('', 'r1', 'v1', new Date(), new Date(), 'Done')).rejects.toThrow('Unauthorized');
		});

		          it('handles empty reservation ID', async () => { // Edge case: empty reservation ID
		              (utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
		              (Reservations.findOne as jest.Mock).mockResolvedValue(null);
		              (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
		              const result = await reservationsService.updateReservations('admin', '', 'v1', new Date(), new Date(), 'Done');
		              expect(result).toEqual({ _id: 'r1' });
		          });

		          it('handles empty vehicle ID', async () => { // Edge case: empty vehicle ID
		              (utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
		              (Reservations.findOne as jest.Mock).mockResolvedValue(null);
		              (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
		              const result = await reservationsService.updateReservations('admin', 'r1', '', new Date(), new Date(), 'Done');
		              expect(result).toEqual({ _id: 'r1' });
		          });

		          it('handles invalid dates', async () => { // Edge case: invalid dates
		              (utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
		              (Reservations.findOne as jest.Mock).mockResolvedValue(null);
		              (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
		              const result = await reservationsService.updateReservations('admin', 'r1', 'v1', new Date('invalid'), new Date(), 'Done');
		              expect(result).toEqual({ _id: 'r1' });
		          });

		          it('handles empty status', async () => { // Edge case: empty status
		              (utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
		              (Reservations.findOne as jest.Mock).mockResolvedValue(null);
		              (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
		              const result = await reservationsService.updateReservations('admin', 'r1', 'v1', new Date(), new Date(), '');
		              expect(result).toEqual({ _id: 'r1' });
		          });

		// Error handling
		it('throws error when admin check fails', async () => { // Error handling: admin check fails
			(utils.checkAdminId as jest.Mock).mockRejectedValue(new Error('Unauthorized access'));
			await expect(reservationsService.updateReservations('admin', 'r1', 'v1', new Date(), new Date(), 'Done')).rejects.toThrow('Unauthorized access');
		});

		it('handles database update error', async () => { // Error handling: database update error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.findOne as jest.Mock).mockResolvedValue(null);
			(Reservations.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));
			await expect(reservationsService.updateReservations('admin', 'r1', 'v1', new Date(), new Date(), 'Done')).rejects.toThrow('Update failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.checkAdminId as jest.Mock).mockResolvedValue(undefined);
			(Reservations.findOne as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.updateReservations('admin', 'r1', 'v1', new Date(), new Date(), 'Done')).rejects.toThrow('Database connection lost');
		});
	});

	describe('cancelReservations', () => {
		it('allows Admin to cancel', async () => {
			(utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
			(Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.cancelReservations('admin', 'r1', 'Canceled');
			expect(result).toEqual({ _id: 'r1' });
		});

		it('throws if non-owner user tries to cancel', async () => {
			(utils.isAdmin as jest.Mock).mockResolvedValue('User');
			(Reservations.findById as jest.Mock).mockResolvedValue({ _id: 'r1', userId: 'owner' });
			await expect(reservationsService.cancelReservations('stranger', 'r1', 'Canceled')).rejects.toThrow(FORBIDDEN_USER);
		});

		it('throws CANCEL_DAY if past leaseStart', async () => {
			(utils.isAdmin as jest.Mock).mockResolvedValue('User');
			const past = new Date(Date.now() - 24*3600*1000);
			(Reservations.findById as jest.Mock).mockResolvedValue({ _id: 'r1', userId: 'u1', leaseStart: past });
			await expect(reservationsService.cancelReservations('u1', 'r1', 'Canceled')).rejects.toThrow(CANCEL_DAY);
		});

		it('allows User owner to cancel before leaseStart', async () => {
			(utils.isAdmin as jest.Mock).mockResolvedValue('User');
			const future = new Date(Date.now() + 24*3600*1000);
			(Reservations.findById as jest.Mock).mockResolvedValue({ _id: 'r1', userId: 'u1', leaseStart: future });
			(Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
			const result = await reservationsService.cancelReservations('u1', 'r1', 'Canceled');
			expect(result).toEqual({ _id: 'r1' });
		});

		// Edge cases
            it('handles empty user ID', async () => { // Edge case: empty user ID
                (utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
                (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
                const result = await reservationsService.cancelReservations('', 'r1', 'Canceled');
                expect(result).toEqual({ _id: 'r1' });
            });

            it('handles empty reservation ID', async () => { // Edge case: empty reservation ID
                (utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
                (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
                const result = await reservationsService.cancelReservations('u1', '', 'Canceled');
                expect(result).toEqual({ _id: 'r1' });
            });

            it('handles empty status', async () => { // Edge case: empty status
                (utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
                (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
                const result = await reservationsService.cancelReservations('u1', 'r1', '');
                expect(result).toEqual({ _id: 'r1' });
            });

            it('handles null user ID', async () => { // Edge case: null user ID
                (utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
                (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
                const result = await reservationsService.cancelReservations(null as any, 'r1', 'Canceled');
                expect(result).toEqual({ _id: 'r1' });
            });

            it('handles null reservation ID', async () => { // Edge case: null reservation ID
                (utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
                (Reservations.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: 'r1' });
                const result = await reservationsService.cancelReservations('u1', null as any, 'Canceled');
                expect(result).toEqual({ _id: 'r1' });
            });

		// Error handling
		it('handles admin check error', async () => { // Error handling: admin check error
			(utils.isAdmin as jest.Mock).mockRejectedValue(new Error('Admin check failed'));
			await expect(reservationsService.cancelReservations('u1', 'r1', 'Canceled')).rejects.toThrow('Admin check failed');
		});

		it('handles reservation not found', async () => { // Error handling: reservation not found
			(utils.isAdmin as jest.Mock).mockResolvedValue('User');
			(Reservations.findById as jest.Mock).mockResolvedValue(null);
			await expect(reservationsService.cancelReservations('u1', 'r1', 'Canceled')).rejects.toThrow();
		});

		it('handles database update error', async () => { // Error handling: database update error
			(utils.isAdmin as jest.Mock).mockResolvedValue('Admin');
			(Reservations.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('Update failed'));
			await expect(reservationsService.cancelReservations('admin', 'r1', 'Canceled')).rejects.toThrow('Update failed');
		});

		it('handles database connection error', async () => { // Error handling: database connection error
			(utils.isAdmin as jest.Mock).mockResolvedValue('User');
			(Reservations.findById as jest.Mock).mockRejectedValue(new Error('Database connection lost'));
			await expect(reservationsService.cancelReservations('u1', 'r1', 'Canceled')).rejects.toThrow('Database connection lost');
		});
	});
});
