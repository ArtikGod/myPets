package repository

import (
	"database/sql"
	"fmt"
	"noteapp/internal/model"
	"time"
)

// NoteRepository интерфейс для работы с заметками в базе данных
type NoteRepository interface {
	GetAll() ([]*model.Note, error)
	GetByID(id int) (*model.Note, error)
	Create(text string) (*model.Note, error)
	Update(id int, text string) (*model.Note, error)
	Delete(id int) error
}

// noteRepository реализация репозитория для заметок
type noteRepository struct {
	db *sql.DB
}

// NewNoteRepository создает новый экземпляр репозитория заметок
func NewNoteRepository(db *sql.DB) NoteRepository {
	return &noteRepository{db: db}
}

// GetAll возвращает все заметки из базы данных
func (r *noteRepository) GetAll() ([]*model.Note, error) {
	query := "SELECT id, text, created_at FROM notes ORDER BY created_at DESC"
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query notes: %w", err)
	}
	defer rows.Close()

	var notes []*model.Note
	for rows.Next() {
		note := &model.Note{}
		err := rows.Scan(&note.ID, &note.Text, &note.CreatedAt)
		if err != nil {
			return nil, fmt.Errorf("failed to scan note: %w", err)
		}
		notes = append(notes, note)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("rows iteration error: %w", err)
	}

	return notes, nil
}

// GetByID возвращает заметку по ID
func (r *noteRepository) GetByID(id int) (*model.Note, error) {
	query := "SELECT id, text, created_at FROM notes WHERE id = ?"
	row := r.db.QueryRow(query, id)

	note := &model.Note{}
	err := row.Scan(&note.ID, &note.Text, &note.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, model.ErrNoteNotFound
		}
		return nil, fmt.Errorf("failed to scan note: %w", err)
	}

	return note, nil
}

// Create создает новую заметку
func (r *noteRepository) Create(text string) (*model.Note, error) {
	query := "INSERT INTO notes (text, created_at) VALUES (?, ?)"
	createdAt := time.Now()
	
	result, err := r.db.Exec(query, text, createdAt)
	if err != nil {
		return nil, fmt.Errorf("failed to create note: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return &model.Note{
		ID:        int(id),
		Text:      text,
		CreatedAt: createdAt,
	}, nil
}

// Update обновляет существующую заметку
func (r *noteRepository) Update(id int, text string) (*model.Note, error) {
	// Сначала проверим, существует ли заметка
	_, err := r.GetByID(id)
	if err != nil {
		return nil, err
	}

	query := "UPDATE notes SET text = ? WHERE id = ?"
	_, err = r.db.Exec(query, text, id)
	if err != nil {
		return nil, fmt.Errorf("failed to update note: %w", err)
	}

	// Возвращаем обновленную заметку
	return r.GetByID(id)
}

// Delete удаляет заметку по ID
func (r *noteRepository) Delete(id int) error {
	// Сначала проверим, существует ли заметка
	_, err := r.GetByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM notes WHERE id = ?"
	_, err = r.db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete note: %w", err)
	}

	return nil
}