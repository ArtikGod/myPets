package service

import (
	"noteapp/internal/model"
	"noteapp/internal/repository"
)

// NoteService интерфейс для бизнес-логики работы с заметками
type NoteService interface {
	GetAllNotes() ([]*model.Note, error)
	GetNoteByID(id int) (*model.Note, error)
	CreateNote(req *model.CreateNoteRequest) (*model.Note, error)
	UpdateNote(id int, req *model.UpdateNoteRequest) (*model.Note, error)
	DeleteNote(id int) error
}

// noteService реализация сервиса для заметок
type noteService struct {
	repo repository.NoteRepository
}

// NewNoteService создает новый экземпляр сервиса заметок
func NewNoteService(repo repository.NoteRepository) NoteService {
	return &noteService{repo: repo}
}

// GetAllNotes возвращает все заметки
func (s *noteService) GetAllNotes() ([]*model.Note, error) {
	return s.repo.GetAll()
}

// GetNoteByID возвращает заметку по ID
func (s *noteService) GetNoteByID(id int) (*model.Note, error) {
	if id <= 0 {
		return nil, model.ErrNoteNotFound
	}
	return s.repo.GetByID(id)
}

// CreateNote создает новую заметку с валидацией
func (s *noteService) CreateNote(req *model.CreateNoteRequest) (*model.Note, error) {
	if err := model.ValidateText(req.Text); err != nil {
		return nil, err
	}
	
	return s.repo.Create(req.Text)
}

// UpdateNote обновляет существующую заметку с валидацией
func (s *noteService) UpdateNote(id int, req *model.UpdateNoteRequest) (*model.Note, error) {
	if id <= 0 {
		return nil, model.ErrNoteNotFound
	}
	
	if err := model.ValidateText(req.Text); err != nil {
		return nil, err
	}
	
	return s.repo.Update(id, req.Text)
}

// DeleteNote удаляет заметку по ID
func (s *noteService) DeleteNote(id int) error {
	if id <= 0 {
		return model.ErrNoteNotFound
	}
	
	return s.repo.Delete(id)
}