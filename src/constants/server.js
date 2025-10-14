module.exports = {
    PORT: process.env.PORT,
    API_PREFIX: "/api",
    ROUTES: {
        BOOKINGS: "/bookings",
    },
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        CONFLICT: 409,
        INTERNAL_ERROR: 500,
    },
};
