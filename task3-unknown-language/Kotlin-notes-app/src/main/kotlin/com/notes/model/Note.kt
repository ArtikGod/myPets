package com.notes.model

import kotlinx.serialization.Serializable
import kotlinx.datetime.Instant

/**
 * Модель заметки
 * @property id Уникальный идентификатор заметки
 * @property text Текст заметки (1-500 символов)
 * @property createdAt Время создания заметки
 */
@Serializable
data class Note(
    val id: Long = 0,
    val text: String,
    val createdAt: String
)

/**
 * DTO для создания новой заметки
 * @property text Текст заметки
 */
@Serializable
data class CreateNoteRequest(
    val text: String
)

/**
 * DTO для обновления заметки
 * @property text Новый текст заметки
 */
@Serializable
data class UpdateNoteRequest(
    val text: String
)

/**
 * DTO для ответа с ошибкой
 * @property error Сообщение об ошибке
 */
@Serializable
data class ErrorResponse(
    val error: String
)