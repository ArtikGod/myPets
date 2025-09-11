package com.notes.service

import com.notes.model.Note
import com.notes.repository.NoteRepository

/**
 * Исключение для ошибок валидации
 */
class ValidationException(message: String) : Exception(message)

/**
 * Исключение для случаев, когда заметка не найдена
 */
class NoteNotFoundException(message: String) : Exception(message)

/**
 * Сервис для работы с заметками, содержит бизнес-логику и валидацию
 */
class NoteService(private val noteRepository: NoteRepository) {
    
    companion object {
        private const val MIN_TEXT_LENGTH = 1
        private const val MAX_TEXT_LENGTH = 500
    }
    
    /**
     * Получить все заметки
     * @return список всех заметок
     */
    fun getAllNotes(): List<Note> {
        return noteRepository.findAll()
    }
    
    /**
     * Получить заметку по ID
     * @param id идентификатор заметки
     * @return заметка
     * @throws NoteNotFoundException если заметка не найдена
     */
    fun getNoteById(id: Long): Note {
        return noteRepository.findById(id) 
            ?: throw NoteNotFoundException("Заметка с ID $id не найдена")
    }
    
    /**
     * Создать новую заметку
     * @param text текст заметки
     * @return созданная заметка
     * @throws ValidationException если текст не прошел валидацию
     */
    fun createNote(text: String): Note {
        validateNoteText(text)
        return noteRepository.create(text.trim())
    }
    
    /**
     * Обновить заметку
     * @param id идентификатор заметки
     * @param text новый текст заметки
     * @return обновленная заметка
     * @throws ValidationException если текст не прошел валидацию
     * @throws NoteNotFoundException если заметка не найдена
     */
    fun updateNote(id: Long, text: String): Note {
        validateNoteText(text)
        
        return noteRepository.update(id, text.trim()) 
            ?: throw NoteNotFoundException("Заметка с ID $id не найдена")
    }
    
    /**
     * Удалить заметку
     * @param id идентификатор заметки
     * @throws NoteNotFoundException если заметка не найдена
     */
    fun deleteNote(id: Long) {
        val deleted = noteRepository.delete(id)
        if (!deleted) {
            throw NoteNotFoundException("Заметка с ID $id не найдена")
        }
    }
    
    /**
     * Валидация текста заметки
     * @param text текст для валидации
     * @throws ValidationException если текст не соответствует требованиям
     */
    private fun validateNoteText(text: String) {
        val trimmedText = text.trim()
        
        when {
            trimmedText.isEmpty() -> {
                throw ValidationException("Текст заметки не может быть пустым")
            }
            trimmedText.length < MIN_TEXT_LENGTH -> {
                throw ValidationException("Текст заметки должен содержать минимум $MIN_TEXT_LENGTH символ")
            }
            trimmedText.length > MAX_TEXT_LENGTH -> {
                throw ValidationException("Текст заметки не может превышать $MAX_TEXT_LENGTH символов")
            }
        }
    }
    
    /**
     * Проверить существование заметки
     * @param id идентификатор заметки
     * @return true если заметка существует, false в противном случае
     */
    fun noteExists(id: Long): Boolean {
        return try {
            noteRepository.findById(id) != null
        } catch (e: Exception) {
            false
        }
    }
}