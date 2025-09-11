package com.notes.handler

import com.notes.model.CreateNoteRequest
import com.notes.model.ErrorResponse
import com.notes.model.UpdateNoteRequest
import com.notes.service.NoteNotFoundException
import com.notes.service.NoteService
import com.notes.service.ValidationException
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

/**
 * HTTP обработчики для работы с заметками
 */
class NoteHandler(private val noteService: NoteService) {
    
    /**
     * Настройка маршрутов для заметок
     */
    fun configureRoutes(routing: Routing) {
        routing {
            route("/notes") {
                // GET /notes - получить все заметки
                get {
                    try {
                        val notes = noteService.getAllNotes()
                        call.respond(HttpStatusCode.OK, notes)
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            ErrorResponse("Внутренняя ошибка сервера: ${e.message}")
                        )
                    }
                }
                
                // POST /notes - создать новую заметку
                post {
                    try {
                        val request = call.receive<CreateNoteRequest>()
                        val note = noteService.createNote(request.text)
                        call.respond(HttpStatusCode.Created, note)
                    } catch (e: ValidationException) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(e.message ?: "Ошибка валидации")
                        )
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            ErrorResponse("Внутренняя ошибка сервера: ${e.message}")
                        )
                    }
                }
                
                // PUT /notes/{id} - обновить заметку
                put("/{id}") {
                    try {
                        val id = call.parameters["id"]?.toLongOrNull()
                        if (id == null) {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ErrorResponse("Неверный формат ID")
                            )
                            return@put
                        }
                        
                        val request = call.receive<UpdateNoteRequest>()
                        val note = noteService.updateNote(id, request.text)
                        call.respond(HttpStatusCode.OK, note)
                    } catch (e: ValidationException) {
                        call.respond(
                            HttpStatusCode.BadRequest,
                            ErrorResponse(e.message ?: "Ошибка валидации")
                        )
                    } catch (e: NoteNotFoundException) {
                        call.respond(
                            HttpStatusCode.NotFound,
                            ErrorResponse(e.message ?: "Заметка не найдена")
                        )
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            ErrorResponse("Внутренняя ошибка сервера: ${e.message}")
                        )
                    }
                }
                
                // DELETE /notes/{id} - удалить заметку
                delete("/{id}") {
                    try {
                        val id = call.parameters["id"]?.toLongOrNull()
                        if (id == null) {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ErrorResponse("Неверный формат ID")
                            )
                            return@delete
                        }
                        
                        noteService.deleteNote(id)
                        call.respond(HttpStatusCode.NoContent)
                    } catch (e: NoteNotFoundException) {
                        call.respond(
                            HttpStatusCode.NotFound,
                            ErrorResponse(e.message ?: "Заметка не найдена")
                        )
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            ErrorResponse("Внутренняя ошибка сервера: ${e.message}")
                        )
                    }
                }
                
                // GET /notes/{id} - получить заметку по ID (дополнительный эндпоинт)
                get("/{id}") {
                    try {
                        val id = call.parameters["id"]?.toLongOrNull()
                        if (id == null) {
                            call.respond(
                                HttpStatusCode.BadRequest,
                                ErrorResponse("Неверный формат ID")
                            )
                            return@get
                        }
                        
                        val note = noteService.getNoteById(id)
                        call.respond(HttpStatusCode.OK, note)
                    } catch (e: NoteNotFoundException) {
                        call.respond(
                            HttpStatusCode.NotFound,
                            ErrorResponse(e.message ?: "Заметка не найдена")
                        )
                    } catch (e: Exception) {
                        call.respond(
                            HttpStatusCode.InternalServerError,
                            ErrorResponse("Внутренняя ошибка сервера: ${e.message}")
                        )
                    }
                }
            }
        }
    }
}