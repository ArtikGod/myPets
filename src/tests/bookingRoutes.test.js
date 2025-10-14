const request = require("supertest");
const express = require("express");
const bookingRoutes = require("../routes/bookingRoutes");
const { HTTP_STATUS } = require("../constants/server");
const { BOOKING_STATUS, BOOKING_ERRORS } = require("../constants/bookings");

jest.mock("../services/bookingService");

const app = express();
app.use(express.json());
app.use("/api/bookings", bookingRoutes);

describe("Booking Routes", () => {
    let mockBookingService;

    beforeEach(() => {
        mockBookingService = require("../services/bookingService");
        jest.clearAllMocks();
    });

    describe("POST /api/bookings/reserve", () => {
        it("должен успешно создать бронирование", async () => {
            const mockBooking = {
                id: 1,
                event_id: 1,
                user_id: "user123",
            };

            mockBookingService.reserveBooking.mockResolvedValue(mockBooking);

            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    event_id: 1,
                    user_id: "user123",
                });

            expect(response.status).toBe(HTTP_STATUS.CREATED);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.SUCCESS,
                data: mockBooking,
            });
            expect(mockBookingService.reserveBooking).toHaveBeenCalledWith(
                1,
                "user123"
            );
        });

        it("должен вернуть ошибку при отсутствии event_id", async () => {
            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    user_id: "user123",
                });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.ERROR,
                message: BOOKING_ERRORS.INVALID_DATA,
            });
            expect(mockBookingService.reserveBooking).not.toHaveBeenCalled();
        });

        it("должен вернуть ошибку при отсутствии user_id", async () => {
            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    event_id: 1,
                });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.ERROR,
                message: BOOKING_ERRORS.INVALID_DATA,
            });
            expect(mockBookingService.reserveBooking).not.toHaveBeenCalled();
        });

        it("должен вернуть ошибку конфликта при дублировании", async () => {
            mockBookingService.reserveBooking.mockRejectedValue(
                new Error(BOOKING_ERRORS.DUPLICATE_BOOKING)
            );

            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    event_id: 1,
                    user_id: "user123",
                });

            expect(response.status).toBe(HTTP_STATUS.CONFLICT);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.ERROR,
                message: BOOKING_ERRORS.DUPLICATE_BOOKING,
            });
        });

        it("должен вернуть ошибку при отсутствии события", async () => {
            mockBookingService.reserveBooking.mockRejectedValue(
                new Error(BOOKING_ERRORS.EVENT_NOT_FOUND)
            );

            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    event_id: 999,
                    user_id: "user123",
                });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.ERROR,
                message: BOOKING_ERRORS.EVENT_NOT_FOUND,
            });
        });

        it("должен вернуть ошибку при отсутствии мест", async () => {
            mockBookingService.reserveBooking.mockRejectedValue(
                new Error(BOOKING_ERRORS.NO_AVAILABLE_SEATS)
            );

            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    event_id: 1,
                    user_id: "user123",
                });

            expect(response.status).toBe(HTTP_STATUS.BAD_REQUEST);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.ERROR,
                message: BOOKING_ERRORS.NO_AVAILABLE_SEATS,
            });
        });

        it("должен вернуть внутреннюю ошибку сервера", async () => {
            mockBookingService.reserveBooking.mockRejectedValue(
                new Error("Database connection failed")
            );

            const response = await request(app)
                .post("/api/bookings/reserve")
                .send({
                    event_id: 1,
                    user_id: "user123",
                });

            expect(response.status).toBe(HTTP_STATUS.INTERNAL_ERROR);
            expect(response.body).toEqual({
                status: BOOKING_STATUS.ERROR,
                message: "Database connection failed",
            });
        });
    });
});
