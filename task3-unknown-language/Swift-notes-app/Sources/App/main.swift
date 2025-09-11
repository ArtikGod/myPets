import Foundation
import Vapor

/// Точка входа в приложение
@main
struct App {
    static func main() async throws {
        var env = try Environment.detect()
        try LoggingSystem.bootstrap(from: &env)
        
        let app = Application(env)
        defer { app.shutdown() }
        
        try await configure(app)
        try await app.run()
    }
}

/// Конфигурация приложения
func configure(_ app: Application) async throws {
    // Инициализация базы данных
    try DatabaseManager.shared.initialize()
    print("База данных инициализирована успешно")
    
    // Настройка middleware
    app.middleware.use(ErrorMiddleware.default(environment: app.environment))
    app.middleware.use(CORSMiddleware())
    
    // Регистрация роутов
    try routes(app)
    
    print("Сервер запущен на порту 8080")
    print("Доступные endpoints:")
    print("  GET    /notes      - Получить все заметки")
    print("  GET    /notes/{id} - Получить заметку по ID")
    print("  POST   /notes      - Создать новую заметку")
    print("  PUT    /notes/{id} - Обновить заметку")
    print("  DELETE /notes/{id} - Удалить заметку")
}

/// Настройка роутов
func routes(_ app: Application) throws {
    let noteHandler = NoteHandler()
    
    // Группа роутов для заметок
    let notesGroup = app.grouped("notes")
    
    // GET /notes - Получить все заметки
    notesGroup.get { req in
        return try await noteHandler.getAllNotes(req: req)
    }
    
    // GET /notes/{id} - Получить заметку по ID
    notesGroup.get(":id") { req in
        return try await noteHandler.getNoteById(req: req)
    }
    
    // POST /notes - Создать новую заметку
    notesGroup.post { req in
        return try await noteHandler.createNote(req: req)
    }
    
    // PUT /notes/{id} - Обновить заметку
    notesGroup.put(":id") { req in
        return try await noteHandler.updateNote(req: req)
    }
    
    // DELETE /notes/{id} - Удалить заметку
    notesGroup.delete(":id") { req in
        return try await noteHandler.deleteNote(req: req)
    }
    
    // Корневой роут для проверки работоспособности
    app.get { req in
        return [
            "message": "Notes API работает!",
            "version": "1.0.0",
            "endpoints": [
                "GET /notes - Получить все заметки",
                "GET /notes/{id} - Получить заметку по ID",
                "POST /notes - Создать новую заметку",
                "PUT /notes/{id} - Обновить заметку",
                "DELETE /notes/{id} - Удалить заметку"
            ]
        ]
    }
    
    // Обработка несуществующих роутов
    app.all("**") { req in
        let errorResponse = ErrorResponse(
            error: "NotFound",
            message: "Endpoint не найден"
        )
        return try await req.response.json(errorResponse, status: .notFound)
    }
}