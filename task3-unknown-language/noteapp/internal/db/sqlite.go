package db

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// DB представляет подключение к базе данных
type DB struct {
	*sql.DB
}

// NewSQLiteDB создает новое подключение к SQLite базе данных
func NewSQLiteDB(dataSourceName string) (*DB, error) {
	db, err := sql.Open("sqlite3", dataSourceName)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &DB{db}, nil
}

// InitSchema создает необходимые таблицы в базе данных
func (db *DB) InitSchema() error {
	query := `
	CREATE TABLE IF NOT EXISTS notes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		text TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	if _, err := db.Exec(query); err != nil {
		return fmt.Errorf("failed to create notes table: %w", err)
	}

	return nil
}

// Close закрывает подключение к базе данных
func (db *DB) Close() error {
	return db.DB.Close()
}