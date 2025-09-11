use crate::database::DbPool;
use crate::models::Note;
use anyhow::Result;
use uuid::Uuid;

#[derive(Clone)]
pub struct NoteRepository {
    pool: DbPool,
}

impl NoteRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    pub async fn create(&self, note: &Note) -> Result<()> {
        sqlx::query(
            "INSERT INTO notes (id, text, created_at, updated_at) VALUES (?, ?, ?, ?)"
        )
        .bind(note.id.to_string())
        .bind(&note.text)
        .bind(note.created_at.to_rfc3339())
        .bind(note.updated_at.to_rfc3339())
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn find_all(&self) -> Result<Vec<Note>> {
        let notes = sqlx::query_as::<_, NoteRow>(
            "SELECT id, text, created_at, updated_at FROM notes ORDER BY created_at DESC"
        )
        .fetch_all(&self.pool)
        .await?;

        let notes = notes
            .into_iter()
            .map(|row| row.into_note())
            .collect::<Result<Vec<_>, _>>()?;

        Ok(notes)
    }

    pub async fn find_by_id(&self, id: Uuid) -> Result<Option<Note>> {
        let note = sqlx::query_as::<_, NoteRow>(
            "SELECT id, text, created_at, updated_at FROM notes WHERE id = ?"
        )
        .bind(id.to_string())
        .fetch_optional(&self.pool)
        .await?;

        match note {
            Some(row) => Ok(Some(row.into_note()?)),
            None => Ok(None),
        }
    }

    pub async fn update(&self, note: &Note) -> Result<bool> {
        let result = sqlx::query(
            "UPDATE notes SET text = ?, updated_at = ? WHERE id = ?"
        )
        .bind(&note.text)
        .bind(note.updated_at.to_rfc3339())
        .bind(note.id.to_string())
        .execute(&self.pool)
        .await?;

        Ok(result.rows_affected() > 0)
    }

    pub async fn delete(&self, id: Uuid) -> Result<bool> {
        let result = sqlx::query("DELETE FROM notes WHERE id = ?")
            .bind(id.to_string())
            .execute(&self.pool)
            .await?;

        Ok(result.rows_affected() > 0)
    }
}

#[derive(sqlx::FromRow)]
struct NoteRow {
    id: String,
    text: String,
    created_at: String,
    updated_at: String,
}

impl NoteRow {
    fn into_note(self) -> Result<Note> {
        use chrono::DateTime;
        
        Ok(Note {
            id: Uuid::parse_str(&self.id)?,
            text: self.text,
            created_at: DateTime::parse_from_rfc3339(&self.created_at)?.with_timezone(&chrono::Utc),
            updated_at: DateTime::parse_from_rfc3339(&self.updated_at)?.with_timezone(&chrono::Utc),
        })
    }
}