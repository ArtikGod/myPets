use crate::models::{Note, CreateNoteRequest, UpdateNoteRequest, validate_note_text, ValidationError};
use crate::repository::NoteRepository;
use anyhow::Result;
use uuid::Uuid;

#[derive(thiserror::Error, Debug)]
pub enum ServiceError {
    #[error("Заметка не найдена")]
    NotFound,
    #[error("Ошибка валидации: {0}")]
    Validation(#[from] ValidationError),
    #[error("Ошибка базы данных: {0}")]
    Database(#[from] anyhow::Error),
}

#[derive(Clone)]
pub struct NoteService {
    repository: NoteRepository,
}

impl NoteService {
    pub fn new(repository: NoteRepository) -> Self {
        Self { repository }
    }

    pub async fn create_note(&self, request: CreateNoteRequest) -> Result<Note, ServiceError> {
        // Валидация входных данных
        validate_note_text(&request.text)?;

        let note = Note::new(request.text);
        self.repository.create(&note).await?;

        Ok(note)
    }

    pub async fn get_all_notes(&self) -> Result<Vec<Note>, ServiceError> {
        let notes = self.repository.find_all().await?;
        Ok(notes)
    }

    pub async fn get_note_by_id(&self, id: Uuid) -> Result<Note, ServiceError> {
        match self.repository.find_by_id(id).await? {
            Some(note) => Ok(note),
            None => Err(ServiceError::NotFound),
        }
    }

    pub async fn update_note(&self, id: Uuid, request: UpdateNoteRequest) -> Result<Note, ServiceError> {
        // Валидация входных данных
        validate_note_text(&request.text)?;

        // Проверяем, существует ли заметка
        let mut note = match self.repository.find_by_id(id).await? {
            Some(note) => note,
            None => return Err(ServiceError::NotFound),
        };

        // Обновляем заметку
        note.update_text(request.text);
        
        // Сохраняем изменения
        self.repository.update(&note).await?;

        Ok(note)
    }

    pub async fn delete_note(&self, id: Uuid) -> Result<(), ServiceError> {
        let deleted = self.repository.delete(id).await?;
        
        if !deleted {
            return Err(ServiceError::NotFound);
        }

        Ok(())
    }
}