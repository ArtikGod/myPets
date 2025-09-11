import Foundation
import Vapor

/// Протокол сервиса для работы с заметками
protocol NoteServiceProtocol {
    func getAllNotes() throws -> [Note]
    func getNoteById(_ id: Int) throws -> Note
    func createNote(from request: CreateNoteRequest) throws -> Note
    func updateNote(_ id: Int, with request: UpdateNoteRequest) throws -> Note
    func deleteNote(_ id: Int) throws
}

/// Сервис для работы с заметками, содержащий бизнес-логику
class NoteService: NoteServiceProtocol {
    private let repository: NoteRepositoryProtocol
    
    init(repository: NoteRepositoryProtocol = NoteRepository()) {
        self.repository = repository
    }
    
    /// Получить все заметки
    func getAllNotes() throws -> [Note] {
        do {
            return try repository.getAllNotes()
        } catch {
            print("Ошибка при получении всех заметок: \(error)")
            throw NoteServiceError.databaseError(error.localizedDescription)
        }
    }
    
    /// Получить заметку по ID
    func getNoteById(_ id: Int) throws -> Note {
        guard id > 0 else {
            throw NoteServiceError.invalidId
        }
        
        do {
            guard let note = try repository.getNoteById(id) else {
                throw NoteServiceError.noteNotFound
            }
            return note
        } catch let error as NoteServiceError {
            throw error
        } catch {
            print("Ошибка при получении заметки с ID \(id): \(error)")
            throw NoteServiceError.databaseError(error.localizedDescription)
        }
    }
    
    /// Создать новую заметку
    func createNote(from request: CreateNoteRequest) throws -> Note {
        // Валидация текста заметки
        let trimmedText = request.text.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !trimmedText.isEmpty else {
            throw NoteServiceError.emptyText
        }
        
        guard trimmedText.count <= 500 else {
            throw NoteServiceError.textTooLong
        }
        
        let note = Note(text: trimmedText, createdAt: Date())
        
        do {
            return try repository.createNote(note)
        } catch {
            print("Ошибка при создании заметки: \(error)")
            throw NoteServiceError.databaseError(error.localizedDescription)
        }
    }
    
    /// Обновить заметку
    func updateNote(_ id: Int, with request: UpdateNoteRequest) throws -> Note {
        guard id > 0 else {
            throw NoteServiceError.invalidId
        }
        
        // Валидация текста заметки
        let trimmedText = request.text.trimmingCharacters(in: .whitespacesAndNewlines)
        
        guard !trimmedText.isEmpty else {
            throw NoteServiceError.emptyText
        }
        
        guard trimmedText.count <= 500 else {
            throw NoteServiceError.textTooLong
        }
        
        do {
            guard let updatedNote = try repository.updateNote(id, text: trimmedText) else {
                throw NoteServiceError.noteNotFound
            }
            return updatedNote
        } catch let error as NoteServiceError {
            throw error
        } catch {
            print("Ошибка при обновлении заметки с ID \(id): \(error)")
            throw NoteServiceError.databaseError(error.localizedDescription)
        }
    }
    
    /// Удалить заметку
    func deleteNote(_ id: Int) throws {
        guard id > 0 else {
            throw NoteServiceError.invalidId
        }
        
        do {
            let deleted = try repository.deleteNote(id)
            if !deleted {
                throw NoteServiceError.noteNotFound
            }
        } catch let error as NoteServiceError {
            throw error
        } catch {
            print("Ошибка при удалении заметки с ID \(id): \(error)")
            throw NoteServiceError.databaseError(error.localizedDescription)
        }
    }
}

/// Ошибки сервиса заметок
enum NoteServiceError: Error, LocalizedError {
    case invalidId
    case noteNotFound
    case emptyText
    case textTooLong
    case databaseError(String)
    
    var errorDescription: String? {
        switch self {
        case .invalidId:
            return "Некорректный ID заметки"
        case .noteNotFound:
            return "Заметка не найдена"
        case .emptyText:
            return "Текст заметки не может быть пустым"
        case .textTooLong:
            return "Текст заметки не может превышать 500 символов"
        case .databaseError(let message):
            return "Ошибка базы данных: \(message)"
        }
    }
    
    var httpStatus: HTTPResponseStatus {
        switch self {
        case .invalidId, .emptyText, .textTooLong:
            return .badRequest
        case .noteNotFound:
            return .notFound
        case .databaseError:
            return .internalServerError
        }
    }
}