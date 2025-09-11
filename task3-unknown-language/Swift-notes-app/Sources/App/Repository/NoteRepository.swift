import Foundation
import SQLite

/// Протокол репозитория для заметок
protocol NoteRepositoryProtocol {
    func getAllNotes() throws -> [Note]
    func getNoteById(_ id: Int) throws -> Note?
    func createNote(_ note: Note) throws -> Note
    func updateNote(_ id: Int, text: String) throws -> Note?
    func deleteNote(_ id: Int) throws -> Bool
}

/// Реализация репозитория для работы с заметками в SQLite
class NoteRepository: NoteRepositoryProtocol {
    private let dbManager = DatabaseManager.shared
    
    /// Получить все заметки
    func getAllNotes() throws -> [Note] {
        let db = try dbManager.getConnection()
        let notesTable = dbManager.getNotesTable()
        let columns = dbManager.getColumns()
        
        var notes: [Note] = []
        
        for row in try db.prepare(notesTable.order(columns.createdAt.desc)) {
            let note = Note(
                id: row[columns.id],
                text: row[columns.text],
                createdAt: row[columns.createdAt]
            )
            notes.append(note)
        }
        
        return notes
    }
    
    /// Получить заметку по ID
    func getNoteById(_ id: Int) throws -> Note? {
        let db = try dbManager.getConnection()
        let notesTable = dbManager.getNotesTable()
        let columns = dbManager.getColumns()
        
        let query = notesTable.filter(columns.id == id)
        
        if let row = try db.pluck(query) {
            return Note(
                id: row[columns.id],
                text: row[columns.text],
                createdAt: row[columns.createdAt]
            )
        }
        
        return nil
    }
    
    /// Создать новую заметку
    func createNote(_ note: Note) throws -> Note {
        let db = try dbManager.getConnection()
        let notesTable = dbManager.getNotesTable()
        let columns = dbManager.getColumns()
        
        let insert = notesTable.insert(
            columns.text <- note.text,
            columns.createdAt <- note.createdAt
        )
        
        let rowId = try db.run(insert)
        
        return Note(
            id: Int(rowId),
            text: note.text,
            createdAt: note.createdAt
        )
    }
    
    /// Обновить заметку
    func updateNote(_ id: Int, text: String) throws -> Note? {
        let db = try dbManager.getConnection()
        let notesTable = dbManager.getNotesTable()
        let columns = dbManager.getColumns()
        
        let noteToUpdate = notesTable.filter(columns.id == id)
        let updatedRows = try db.run(noteToUpdate.update(columns.text <- text))
        
        if updatedRows > 0 {
            return try getNoteById(id)
        }
        
        return nil
    }
    
    /// Удалить заметку
    func deleteNote(_ id: Int) throws -> Bool {
        let db = try dbManager.getConnection()
        let notesTable = dbManager.getNotesTable()
        let columns = dbManager.getColumns()
        
        let noteToDelete = notesTable.filter(columns.id == id)
        let deletedRows = try db.run(noteToDelete.delete())
        
        return deletedRows > 0
    }
}