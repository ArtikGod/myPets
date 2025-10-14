module.exports = {
    EVENTS: {
        SELECT_BY_ID: 'SELECT id, total_seats FROM events WHERE id = $1'
    },
    BOOKINGS: {
        SELECT_EXISTING: 'SELECT id FROM bookings WHERE event_id = $1 AND user_id = $2',
        COUNT_BY_EVENT: 'SELECT COUNT(*) FROM bookings WHERE event_id = $1',
        INSERT_BOOKING: 'INSERT INTO bookings (event_id, user_id, created_at) VALUES ($1, $2, NOW()) RETURNING id'
    },
    TRANSACTIONS: {
        BEGIN: 'BEGIN',
        COMMIT: 'COMMIT',
        ROLLBACK: 'ROLLBACK'
    }
};
