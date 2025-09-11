import Foundation
import SQLite

/// Менеджер базы данных SQLite
class DatabaseManager {
    private var db: Connection?
    private let notes = Table("notes")
    private let id = Expression<Int>("id")
    private let text = Expression<String>("text")
    private let createdAt = Expression<Date>("created_at")
    
    static let shared = DatabaseManager()
    
    private init() {}
    
    /// Инициализация подключения к базе данных
    func initialize() throws {
        let path = NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
        let dbPath = "\(path)/notes.sqlite3"
        
        print("База данных находится по пути: \(dbPath)")
        
        db = try Connection(dbPath)
        try createTable()
    }
    
    /// Создание таблицы notes если она не существует
    private func createTable() throws {
        guard let db = db else {
            throw DatabaseError.connectionNotInitialized
        }
        
        try db.run(notes.create(ifNotExists: true) { t in
            t.column(id, primaryKey: .autoincrement)
            t.column(text)
            t.column(createdAt)
        })
        
        print("Таблица notes создана или уже существует")
    }
    
    /// Получение подключения к базе данных
    func getConnection() throws -> Connection {
        guard let db = db else {
            throw DatabaseError.connectionNotInitialized
        }
        return db
    }
    
    /// Получение таблицы notes
    func getNotesTable() -> Table {
        return notes
    }
    
    /// Получение колонок таблицы
    func getColumns() -> (id: Expression<Int>, text: Expression<String>, createdAt: Expression<Date>) {
        return (id: id, text: text, createdAt: createdAt)
    }
}

/// Ошибки базы данных
enum DatabaseError: Error, LocalizedError {
    case connectionNotInitialized
    case noteNotFound
    case invalidData
    
    var errorDescription: String? {
        switch self {
        case .connectionNotInitialized:
            return "Подключение к базе данных не инициализировано"
        case .noteNotFound:
            return "Заметка не найдена"
        case .invalidData:
            return "Некорректные данные"
        }
    }
}