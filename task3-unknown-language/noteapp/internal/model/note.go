package model

import "time"

// Note представляет структуру заметки
type Note struct {
	ID        int       `json:"id" db:"id"`
	Text      string    `json:"text" db:"text"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// CreateNoteRequest представляет запрос на создание заметки
type CreateNoteRequest struct {
	Text string `json:"text"`
}

// UpdateNoteRequest представляет запрос на обновление заметки
type UpdateNoteRequest struct {
	Text string `json:"text"`
}

// ValidateText проверяет валидность текста заметки
func ValidateText(text string) error {
	if text == "" {
		return ErrEmptyText
	}
	if len(text) > 500 {
		return ErrTextTooLong
	}
	return nil
}