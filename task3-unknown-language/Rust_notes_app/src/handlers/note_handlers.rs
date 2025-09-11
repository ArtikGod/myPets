use crate::models::{CreateNoteRequest, UpdateNoteRequest};
use crate::services::{NoteService, ServiceError};
use serde_json::json;
use std::convert::Infallible;
use uuid::Uuid;
use warp::{http::StatusCode, reply, Reply};

#[derive(Clone)]
pub struct NoteHandlers {
    service: NoteService,
}

impl NoteHandlers {
    pub fn new(service: NoteService) -> Self {
        Self { service }
    }

    pub async fn get_all_notes(&self) -> Result<impl Reply, Infallible> {
        match self.service.get_all_notes().await {
            Ok(notes) => Ok(reply::with_status(reply::json(&notes), StatusCode::OK)),
            Err(err) => {
                eprintln!("Ошибка при получении заметок: {}", err);
                Ok(reply::with_status(
                    reply::json(&json!({
                        "error": "Внутренняя ошибка сервера"
                    })),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        }
    }

    pub async fn create_note(&self, request: CreateNoteRequest) -> Result<impl Reply, Infallible> {
        match self.service.create_note(request).await {
            Ok(note) => Ok(reply::with_status(reply::json(&note), StatusCode::CREATED)),
            Err(ServiceError::Validation(err)) => Ok(reply::with_status(
                reply::json(&json!({
                    "error": err.to_string()
                })),
                StatusCode::BAD_REQUEST,
            )),
            Err(err) => {
                eprintln!("Ошибка при создании заметки: {}", err);
                Ok(reply::with_status(
                    reply::json(&json!({
                        "error": "Внутренняя ошибка сервера"
                    })),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        }
    }

    pub async fn get_note_by_id(&self, id: Uuid) -> Result<impl Reply, Infallible> {
        match self.service.get_note_by_id(id).await {
            Ok(note) => Ok(reply::with_status(reply::json(&note), StatusCode::OK)),
            Err(ServiceError::NotFound) => Ok(reply::with_status(
                reply::json(&json!({
                    "error": "Заметка не найдена"
                })),
                StatusCode::NOT_FOUND,
            )),
            Err(err) => {
                eprintln!("Ошибка при получении заметки: {}", err);
                Ok(reply::with_status(
                    reply::json(&json!({
                        "error": "Внутренняя ошибка сервера"
                    })),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        }
    }

    pub async fn update_note(
        &self,
        id: Uuid,
        request: UpdateNoteRequest,
    ) -> Result<impl Reply, Infallible> {
        match self.service.update_note(id, request).await {
            Ok(note) => Ok(reply::with_status(reply::json(&note), StatusCode::OK)),
            Err(ServiceError::NotFound) => Ok(reply::with_status(
                reply::json(&json!({
                    "error": "Заметка не найдена"
                })),
                StatusCode::NOT_FOUND,
            )),
            Err(ServiceError::Validation(err)) => Ok(reply::with_status(
                reply::json(&json!({
                    "error": err.to_string()
                })),
                StatusCode::BAD_REQUEST,
            )),
            Err(err) => {
                eprintln!("Ошибка при обновлении заметки: {}", err);
                Ok(reply::with_status(
                    reply::json(&json!({
                        "error": "Внутренняя ошибка сервера"
                    })),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        }
    }

    pub async fn delete_note(&self, id: Uuid) -> Result<impl Reply, Infallible> {
        match self.service.delete_note(id).await {
            Ok(()) => Ok(reply::with_status(
                reply::json(&json!({
                    "message": "Заметка успешно удалена"
                })),
                StatusCode::OK,
            )),
            Err(ServiceError::NotFound) => Ok(reply::with_status(
                reply::json(&json!({
                    "error": "Заметка не найдена"
                })),
                StatusCode::NOT_FOUND,
            )),
            Err(err) => {
                eprintln!("Ошибка при удалении заметки: {}", err);
                Ok(reply::with_status(
                    reply::json(&json!({
                        "error": "Внутренняя ошибка сервера"
                    })),
                    StatusCode::INTERNAL_SERVER_ERROR,
                ))
            }
        }
    }
}