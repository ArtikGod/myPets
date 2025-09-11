package com.notes.db

import java.sql.Connection
import java.sql.DriverManager
import java.sql.SQLException

/**
 * Класс для управления подключением к базе данных SQLite
 */
object Database {
    private const val DB_URL = "jdbc:sqlite:notes.db"
    
    /**
     * Получить подключение к базе данных
     * @return Connection объект подключения к базе данных
     */
    fun getConnection(): Connection {
        return DriverManager.getConnection(DB_URL)
    }
    
    /**
     * Инициализация базы данных - создание таблицы notes если она не существует
     */
    fun init() {
        try {
            getConnection().use { connection ->
                val statement = connection.createStatement()
                
                // Создание таблицы notes
                val createTableSQL = """
                    CREATE TABLE IF NOT EXISTS notes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        text TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """.trimIndent()
                
                statement.execute(createTableSQL)
                println("База данных инициализирована успешно")
            }
        } catch (e: SQLException) {
            println("Ошибка при инициализации базы данных: ${e.message}")
            throw e
        }
    }
    
    /**
     * Проверка подключения к базе данных
     * @return true если подключение успешно, false в противном случае
     */
    fun testConnection(): Boolean {
        return try {
            getConnection().use { connection ->
                connection.isValid(5)
            }
        } catch (e: SQLException) {
            println("Ошибка подключения к базе данных: ${e.message}")
            false
        }
    }
}