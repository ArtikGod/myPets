const express = require("express");
const bookingService = require("../services/bookingService");
const { HTTP_STATUS } = require("../constants/server");
const { BOOKING_STATUS, BOOKING_ERRORS } = require("../constants/bookings");

const router = express.Router();

router.post("/reserve", async (req, res) => {
    try {
        const { event_id, user_id } = req.body;

        if (!event_id || !user_id) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                status: BOOKING_STATUS.ERROR,
                message: BOOKING_ERRORS.INVALID_DATA,
            });
        }

        const booking = await bookingService.reserveBooking(event_id, user_id);

        res.status(HTTP_STATUS.CREATED).json({
            status: BOOKING_STATUS.SUCCESS,
            data: booking,
        });
    } catch (error) {
        let statusCode = HTTP_STATUS.INTERNAL_ERROR;

        if (error.message === BOOKING_ERRORS.DUPLICATE_BOOKING) {
            statusCode = HTTP_STATUS.CONFLICT;
        } else if (
            error.message === BOOKING_ERRORS.EVENT_NOT_FOUND ||
            error.message === BOOKING_ERRORS.NO_AVAILABLE_SEATS
        ) {
            statusCode = HTTP_STATUS.BAD_REQUEST;
        }

        res.status(statusCode).json({
            status: BOOKING_STATUS.ERROR,
            message: error.message,
        });
    }
});

module.exports = router;
