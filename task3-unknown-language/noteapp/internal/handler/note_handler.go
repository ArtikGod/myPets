package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"noteapp/internal/model"
	"noteapp/internal/service"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// NoteHandler обработчик HTTP запросов для заметок
type NoteHandler struct {
	service service.NoteService
}

// NewNoteHandler создает новый экземпляр обработчика заметок
func NewNoteHandler(service service.NoteService) *NoteHandler {
	return &NoteHandler{service: service}
}

// GetAllNotes обрабатывает GET /notes - получение всех заметок
func (h *NoteHandler) GetAllNotes(w http.ResponseWriter, r *http.Request) {
	notes, err := h.service.GetAllNotes()
	if err != nil {
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to get notes")
		return
	}

	h.writeJSONResponse(w, http.StatusOK, notes)
}

// CreateNote обрабатывает POST /notes - создание новой заметки
func (h *NoteHandler) CreateNote(w http.ResponseWriter, r *http.Request) {
	var req model.CreateNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	note, err := h.service.CreateNote(&req)
	if err != nil {
		if errors.Is(err, model.ErrEmptyText) || errors.Is(err, model.ErrTextTooLong) {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to create note")
		return
	}

	h.writeJSONResponse(w, http.StatusCreated, note)
}

// UpdateNote обрабатывает PUT /notes/{id} - обновление заметки
func (h *NoteHandler) UpdateNote(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid note ID")
		return
	}

	var req model.UpdateNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid JSON format")
		return
	}

	note, err := h.service.UpdateNote(id, &req)
	if err != nil {
		if errors.Is(err, model.ErrNoteNotFound) {
			h.writeErrorResponse(w, http.StatusNotFound, "Note not found")
			return
		}
		if errors.Is(err, model.ErrEmptyText) || errors.Is(err, model.ErrTextTooLong) {
			h.writeErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to update note")
		return
	}

	h.writeJSONResponse(w, http.StatusOK, note)
}

// DeleteNote обрабатывает DELETE /notes/{id} - удаление заметки
func (h *NoteHandler) DeleteNote(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		h.writeErrorResponse(w, http.StatusBadRequest, "Invalid note ID")
		return
	}

	err = h.service.DeleteNote(id)
	if err != nil {
		if errors.Is(err, model.ErrNoteNotFound) {
			h.writeErrorResponse(w, http.StatusNotFound, "Note not found")
			return
		}
		h.writeErrorResponse(w, http.StatusInternalServerError, "Failed to delete note")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// ErrorResponse представляет структуру ответа с ошибкой
type ErrorResponse struct {
	Error string `json:"error"`
}

// writeJSONResponse записывает JSON ответ
func (h *NoteHandler) writeJSONResponse(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// writeErrorResponse записывает ответ с ошибкой
func (h *NoteHandler) writeErrorResponse(w http.ResponseWriter, statusCode int, message string) {
	h.writeJSONResponse(w, statusCode, ErrorResponse{Error: message})
}