CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (event_id) REFERENCES events(id),
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_user ON bookings(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);

INSERT INTO events (name, total_seats) VALUES
('Концерт рок-группы', 100),
('Театральная постановка', 50),
('Конференция по IT', 200)
ON CONFLICT DO NOTHING;