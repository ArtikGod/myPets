import Foundation
import Vapor

/// Модель заметки
struct Note: Content {
    let id: Int?
    let text: String
    let createdAt: Date
    
    init(id: Int? = nil, text: String, createdAt: Date = Date()) {
        self.id = id
        self.text = text
        self.createdAt = createdAt
    }
}

/// DTO для создания заметки
struct CreateNoteRequest: Content {
    let text: String
}

/// DTO для обновления заметки
struct UpdateNoteRequest: Content {
    let text: String
}

/// DTO для ответа с ошибкой
struct ErrorResponse: Content {
    let error: String
    let message: String
}

extension Note: Validatable {
    static func validations(_ validations: inout Validations) {
        validations.add("text", as: String.self, is: .count(1...500) && !.empty)
    }
}

extension CreateNoteRequest: Validatable {
    static func validations(_ validations: inout Validations) {
        validations.add("text", as: String.self, is: .count(1...500) && !.empty)
    }
}

extension UpdateNoteRequest: Validatable {
    static func validations(_ validations: inout Validations) {
        validations.add("text", as: String.self, is: .count(1...500) && !.empty)
    }
}