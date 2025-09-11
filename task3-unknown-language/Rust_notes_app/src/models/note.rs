use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Note {
    pub id: Uuid,
    pub text: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteRequest {
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoteRequest {
    pub text: String,
}

impl Note {
    pub fn new(text: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            text,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn update_text(&mut self, text: String) {
        self.text = text;
        self.updated_at = Utc::now();
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ValidationError {
    #[error("Текст заметки не может быть пустым")]
    EmptyText,
    #[error("Текст заметки не может быть длиннее 500 символов")]
    TextTooLong,
}

pub fn validate_note_text(text: &str) -> Result<(), ValidationError> {
    if text.trim().is_empty() {
        return Err(ValidationError::EmptyText);
    }
    
    if text.len() > 500 {
        return Err(ValidationError::TextTooLong);
    }
    
    Ok(())
}