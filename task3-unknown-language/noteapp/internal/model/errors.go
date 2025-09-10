package model

import "errors"

var (
	// ErrEmptyText возвращается когда текст заметки пустой
	ErrEmptyText = errors.New("text cannot be empty")
	
	// ErrTextTooLong возвращается когда текст заметки слишком длинный
	ErrTextTooLong = errors.New("text cannot be longer than 500 characters")
	
	// ErrNoteNotFound возвращается когда заметка не найдена
	ErrNoteNotFound = errors.New("note not found")
)