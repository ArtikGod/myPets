import Foundation
import Vapor

/// HTTP обработчики для работы с заметками
struct NoteHandler {
    private let noteService: NoteServiceProtocol
    
    init(noteService: NoteServiceProtocol = NoteService()) {
        self.noteService = noteService
    }
    
    /// GET /notes - Получить все заметки
    func getAllNotes(req: Request) async throws -> Response {
        do {
            let notes = try noteService.getAllNotes()
            return try await req.response.json(notes)
        } catch let error as NoteServiceError {
            return try await createErrorResponse(req: req, error: error)
        } catch {
            return try await createErrorResponse(
                req: req,
                status: .internalServerError,
                message: "Внутренняя ошибка сервера"
            )
        }
    }
    
    /// GET /notes/{id} - Получить заметку по ID
    func getNoteById(req: Request) async throws -> Response {
        guard let idString = req.parameters.get("id"),
              let id = Int(idString) else {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Некорректный ID заметки"
            )
        }
        
        do {
            let note = try noteService.getNoteById(id)
            return try await req.response.json(note)
        } catch let error as NoteServiceError {
            return try await createErrorResponse(req: req, error: error)
        } catch {
            return try await createErrorResponse(
                req: req,
                status: .internalServerError,
                message: "Внутренняя ошибка сервера"
            )
        }
    }
    
    /// POST /notes - Создать новую заметку
    func createNote(req: Request) async throws -> Response {
        do {
            let createRequest = try req.content.decode(CreateNoteRequest.self)
            try CreateNoteRequest.validate(content: req)
            
            let note = try noteService.createNote(from: createRequest)
            return try await req.response.json(note, status: .created)
        } catch let error as ValidationError {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Ошибка валидации: \(error.localizedDescription)"
            )
        } catch let error as NoteServiceError {
            return try await createErrorResponse(req: req, error: error)
        } catch {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Некорректные данные запроса"
            )
        }
    }
    
    /// PUT /notes/{id} - Обновить заметку
    func updateNote(req: Request) async throws -> Response {
        guard let idString = req.parameters.get("id"),
              let id = Int(idString) else {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Некорректный ID заметки"
            )
        }
        
        do {
            let updateRequest = try req.content.decode(UpdateNoteRequest.self)
            try UpdateNoteRequest.validate(content: req)
            
            let note = try noteService.updateNote(id, with: updateRequest)
            return try await req.response.json(note)
        } catch let error as ValidationError {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Ошибка валидации: \(error.localizedDescription)"
            )
        } catch let error as NoteServiceError {
            return try await createErrorResponse(req: req, error: error)
        } catch {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Некорректные данные запроса"
            )
        }
    }
    
    /// DELETE /notes/{id} - Удалить заметку
    func deleteNote(req: Request) async throws -> Response {
        guard let idString = req.parameters.get("id"),
              let id = Int(idString) else {
            return try await createErrorResponse(
                req: req,
                status: .badRequest,
                message: "Некорректный ID заметки"
            )
        }
        
        do {
            try noteService.deleteNote(id)
            return Response(status: .noContent)
        } catch let error as NoteServiceError {
            return try await createErrorResponse(req: req, error: error)
        } catch {
            return try await createErrorResponse(
                req: req,
                status: .internalServerError,
                message: "Внутренняя ошибка сервера"
            )
        }
    }
    
    // MARK: - Helper Methods
    
    /// Создать ответ с ошибкой на основе NoteServiceError
    private func createErrorResponse(req: Request, error: NoteServiceError) async throws -> Response {
        let errorResponse = ErrorResponse(
            error: "NoteServiceError",
            message: error.localizedDescription
        )
        return try await req.response.json(errorResponse, status: error.httpStatus)
    }
    
    /// Создать ответ с ошибкой с кастомным статусом и сообщением
    private func createErrorResponse(req: Request, status: HTTPResponseStatus, message: String) async throws -> Response {
        let errorResponse = ErrorResponse(
            error: "RequestError",
            message: message
        )
        return try await req.response.json(errorResponse, status: status)
    }
}

// MARK: - Response Extensions

extension Response {
    /// Создать JSON ответ
    func json<T: Encodable>(_ object: T, status: HTTPResponseStatus = .ok) async throws -> Response {
        self.status = status
        self.headers.contentType = .json
        try self.content.encode(object)
        return self
    }
}