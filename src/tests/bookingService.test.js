const BookingService = require("../services/bookingService");
const { BOOKING_ERRORS } = require("../constants/bookings");

jest.mock("../config/database", () => ({
    connect: jest.fn(),
}));

describe("BookingService", () => {
    let mockClient;
    let mockPool;

    beforeEach(() => {
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        mockPool = require("../config/database");
        mockPool.connect.mockResolvedValue(mockClient);

        jest.clearAllMocks();
    });

    describe("reserveBooking", () => {
        it("должен успешно создать бронирование", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 1, total_seats: 100 }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ count: "5" }] })
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [] });

            const result = await BookingService.reserveBooking(1, "user123");

            expect(result).toEqual({
                id: 1,
                event_id: 1,
                user_id: "user123",
            });
            expect(mockClient.query).toHaveBeenCalledTimes(6);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it("должен выбросить ошибку если событие не найдено", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(
                BookingService.reserveBooking(999, "user123")
            ).rejects.toThrow(BOOKING_ERRORS.EVENT_NOT_FOUND);

            expect(mockClient.release).toHaveBeenCalled();
        });

        it("должен выбросить ошибку при дублировании бронирования", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 1, total_seats: 100 }] })
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(
                BookingService.reserveBooking(1, "user123")
            ).rejects.toThrow(BOOKING_ERRORS.DUPLICATE_BOOKING);

            expect(mockClient.release).toHaveBeenCalled();
        });

        it("должен выбросить ошибку если нет доступных мест", async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ id: 1, total_seats: 10 }] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [{ count: "10" }] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(
                BookingService.reserveBooking(1, "user123")
            ).rejects.toThrow(BOOKING_ERRORS.NO_AVAILABLE_SEATS);

            expect(mockClient.release).toHaveBeenCalled();
        });

        it("должен выполнить rollback при ошибке", async () => {
            const error = new Error("Database error");
            mockClient.query
                .mockResolvedValueOnce({ rows: [] })
                .mockRejectedValueOnce(error)
                .mockResolvedValueOnce({ rows: [] });

            await expect(
                BookingService.reserveBooking(1, "user123")
            ).rejects.toThrow("Database error");

            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});
