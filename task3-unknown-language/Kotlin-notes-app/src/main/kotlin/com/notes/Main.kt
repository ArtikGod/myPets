package com.notes

import com.notes.db.Database
import com.notes.handler.NoteHandler
import com.notes.repository.NoteRepository
import com.notes.service.NoteService
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

/**
 * Главная функция приложения
 */
fun main() {
    // Инициализация базы данных
    println("Инициализация базы данных...")
    Database.init()
    
    // Проверка подключения к базе данных
    if (!Database.testConnection()) {
        println("Не удалось подключиться к базе данных. Завершение работы.")
        return
    }
    
    println("База данных готова к работе")
    
    // Создание экземпляров компонентов
    val noteRepository = NoteRepository()
    val noteService = NoteService(noteRepository)
    val noteHandler = NoteHandler(noteService)
    
    // Запуск сервера
    embeddedServer(Netty, port = 8080, host = "0.0.0.0") {
        configureApplication(noteHandler)
    }.start(wait = true)
}

/**
 * Конфигурация приложения Ktor
 */
fun Application.configureApplication(noteHandler: NoteHandler) {
    // Настройка JSON сериализации
    install(ContentNegotiation) {
        json(Json {
            prettyPrint = true
            isLenient = true
            ignoreUnknownKeys = true
        })
    }
    
    // Настройка обработки ошибок
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.respond(
                io.ktor.http.HttpStatusCode.InternalServerError,
                mapOf("error" to "Внутренняя ошибка сервера: ${cause.localizedMessage}")
            )
        }
    }
    
    // Настройка маршрутов
    routing {
        // Корневой маршрут для проверки работы сервера
        get("/") {
            call.respond(
                mapOf(
                    "message" to "Notes API сервер работает",
                    "version" to "1.0.0",
                    "endpoints" to listOf(
                        "GET /notes - получить все заметки",
                        "POST /notes - создать заметку",
                        "GET /notes/{id} - получить заметку по ID",
                        "PUT /notes/{id} - обновить заметку",
                        "DELETE /notes/{id} - удалить заметку"
                    )
                )
            )
        }
        
        // Маршрут для проверки здоровья сервера
        get("/health") {
            val dbStatus = if (Database.testConnection()) "OK" else "ERROR"
            call.respond(
                mapOf(
                    "status" to "OK",
                    "database" to dbStatus,
                    "timestamp" to System.currentTimeMillis()
                )
            )
        }
        
        // Настройка маршрутов для заметок
        noteHandler.configureRoutes(this)
    }
    
    println("Сервер запущен на http://localhost:8080")
    println("Доступные эндпоинты:")
    println("  GET    /           - информация о сервере")
    println("  GET    /health     - проверка здоровья сервера")
    println("  GET    /notes      - получить все заметки")
    println("  POST   /notes      - создать заметку")
    println("  GET    /notes/{id} - получить заметку по ID")
    println("  PUT    /notes/{id} - обновить заметку")
    println("  DELETE /notes/{id} - удалить заметку")
}