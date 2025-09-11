package com.notes.repository

import com.notes.db.Database
import com.notes.model.Note
import java.sql.SQLException
import java.sql.Timestamp
import java.time.LocalDateTime

/**
 * Репозиторий для работы с заметками в базе данных
 */
class NoteRepository {
    
    /**
     * Получить все заметки
     * @return список всех заметок
     */
    fun findAll(): List<Note> {
        val notes = mutableListOf<Note>()
        
        try {
            Database.getConnection().use { connection ->
                val statement = connection.prepareStatement("SELECT id, text, created_at FROM notes ORDER BY created_at DESC")
                val resultSet = statement.executeQuery()
                
                while (resultSet.next()) {
                    val note = Note(
                        id = resultSet.getLong("id"),
                        text = resultSet.getString("text"),
                        createdAt = resultSet.getString("created_at")
                    )
                    notes.add(note)
                }
            }
        } catch (e: SQLException) {
            println("Ошибка при получении заметок: ${e.message}")
            throw e
        }
        
        return notes
    }
    
    /**
     * Найти заметку по ID
     * @param id идентификатор заметки
     * @return заметка или null если не найдена
     */
    fun findById(id: Long): Note? {
        try {
            Database.getConnection().use { connection ->
                val statement = connection.prepareStatement("SELECT id, text, created_at FROM notes WHERE id = ?")
                statement.setLong(1, id)
                val resultSet = statement.executeQuery()
                
                if (resultSet.next()) {
                    return Note(
                        id = resultSet.getLong("id"),
                        text = resultSet.getString("text"),
                        createdAt = resultSet.getString("created_at")
                    )
                }
            }
        } catch (e: SQLException) {
            println("Ошибка при поиске заметки: ${e.message}")
            throw e
        }
        
        return null
    }
    
    /**
     * Создать новую заметку
     * @param text текст заметки
     * @return созданная заметка
     */
    fun create(text: String): Note {
        try {
            Database.getConnection().use { connection ->
                val statement = connection.prepareStatement(
                    "INSERT INTO notes (text) VALUES (?)",
                    java.sql.Statement.RETURN_GENERATED_KEYS
                )
                statement.setString(1, text)
                
                val affectedRows = statement.executeUpdate()
                if (affectedRows == 0) {
                    throw SQLException("Создание заметки не удалось, ни одна строка не была затронута")
                }
                
                val generatedKeys = statement.generatedKeys
                if (generatedKeys.next()) {
                    val id = generatedKeys.getLong(1)
                    return findById(id) ?: throw SQLException("Не удалось получить созданную заметку")
                } else {
                    throw SQLException("Создание заметки не удалось, ID не был получен")
                }
            }
        } catch (e: SQLException) {
            println("Ошибка при создании заметки: ${e.message}")
            throw e
        }
    }
    
    /**
     * Обновить заметку
     * @param id идентификатор заметки
     * @param text новый текст заметки
     * @return обновленная заметка или null если заметка не найдена
     */
    fun update(id: Long, text: String): Note? {
        try {
            Database.getConnection().use { connection ->
                val statement = connection.prepareStatement("UPDATE notes SET text = ? WHERE id = ?")
                statement.setString(1, text)
                statement.setLong(2, id)
                
                val affectedRows = statement.executeUpdate()
                if (affectedRows > 0) {
                    return findById(id)
                }
            }
        } catch (e: SQLException) {
            println("Ошибка при обновлении заметки: ${e.message}")
            throw e
        }
        
        return null
    }
    
    /**
     * Удалить заметку
     * @param id идентификатор заметки
     * @return true если заметка была удалена, false если заметка не найдена
     */
    fun delete(id: Long): Boolean {
        try {
            Database.getConnection().use { connection ->
                val statement = connection.prepareStatement("DELETE FROM notes WHERE id = ?")
                statement.setLong(1, id)
                
                val affectedRows = statement.executeUpdate()
                return affectedRows > 0
            }
        } catch (e: SQLException) {
            println("Ошибка при удалении заметки: ${e.message}")
            throw e
        }
    }
}