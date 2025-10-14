const pool = require("../config/database");
const { BOOKING_ERRORS } = require("../constants/bookings");
const { EVENTS, BOOKINGS, TRANSACTIONS } = require("../constants/queries");

class BookingService {
    async reserveBooking(eventId, userId) {
        const client = await pool.connect();

        try {
            await client.query(TRANSACTIONS.BEGIN);

            const eventResult = await client.query(EVENTS.SELECT_BY_ID, [
                eventId,
            ]);

            if (eventResult.rows.length === 0) {
                throw new Error(BOOKING_ERRORS.EVENT_NOT_FOUND);
            }

            const existingBooking = await client.query(
                BOOKINGS.SELECT_EXISTING,
                [eventId, userId]
            );

            if (existingBooking.rows.length > 0) {
                throw new Error(BOOKING_ERRORS.DUPLICATE_BOOKING);
            }

            const bookedSeats = await client.query(BOOKINGS.COUNT_BY_EVENT, [
                eventId,
            ]);

            const totalSeats = eventResult.rows[0].total_seats;
            const currentBookings = parseInt(bookedSeats.rows[0].count);

            if (currentBookings >= totalSeats) {
                throw new Error(BOOKING_ERRORS.NO_AVAILABLE_SEATS);
            }

            const result = await client.query(BOOKINGS.INSERT_BOOKING, [
                eventId,
                userId,
            ]);

            await client.query(TRANSACTIONS.COMMIT);

            return {
                id: result.rows[0].id,
                event_id: eventId,
                user_id: userId,
            };
        } catch (error) {
            await client.query(TRANSACTIONS.ROLLBACK);
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new BookingService();
