-- Создание базы данных balance_db
CREATE DATABASE balance_db;

-- Подключение к базе данных
\c balance_db;

-- Создание таблицы users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    balance DECIMAL(10,2) DEFAULT 0.00,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание enum для типов операций
CREATE TYPE payment_action AS ENUM ('DEBIT', 'CREDIT');

-- Создание таблицы payment_history
CREATE TABLE payment_history (
    id SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL REFERENCES users(id),
    action payment_action NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    ts TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    CONSTRAINT fk_user FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- Создание индексов для оптимизации
CREATE INDEX idx_payment_history_user_id ON payment_history("userId");
CREATE INDEX idx_payment_history_ts ON payment_history(ts);

-- Вставка тестового пользователя с id = 1 и балансом 1000
INSERT INTO users (id, balance) VALUES (1, 1000.00);

-- Обновление последовательности для users
SELECT setval('users_id_seq', 1, true);

-- Вставка начальной записи в историю платежей
INSERT INTO payment_history ("userId", action, amount, description) 
VALUES (1, 'CREDIT', 1000.00, 'Начальный баланс');