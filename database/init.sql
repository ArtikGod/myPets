CREATE DATABASE IF NOT EXISTS booking_db;

\c booking_db;

CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE booking_status AS ENUM ('CREATED', 'CHECKING_AVAILABILITY', 'CONFIRMED', 'REJECTED');

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    guest_count INTEGER NOT NULL CHECK (guest_count > 0),
    status booking_status DEFAULT 'CREATED',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_restaurant_date_time 
ON bookings(restaurant_id, booking_date, booking_time);

CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
ON bookings(created_at);

INSERT INTO restaurants (name) VALUES 
    ('Ресторан "Итальянский дворик"'),
    ('Кафе "Уютный уголок"'),
    ('Бистро "Французский шарм"')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

\dt