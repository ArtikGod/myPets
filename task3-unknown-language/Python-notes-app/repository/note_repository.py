"""
Репозиторий для операций с заметками в базе данных.
Содержит методы для CRUD операций с таблицей notes.
"""

import sqlite3
from datetime import datetime
from typing import List, Optional
from db.database import execute_query
from model.note import Note


class NoteRepository:
    """Репозиторий для работы с заметками в базе данных."""
    
    def get_all(self) -> List[Note]:
        """
        Получает все заметки из базы данных.
        
        Returns:
            Список всех заметок
        """
        try:
            query = "SELECT id, text, created_at FROM notes ORDER BY created_at DESC"
            rows = execute_query(query)
            
            notes = []
            for row in rows:
                note = Note(
                    id=row['id'],
                    text=row['text'],
                    created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
                )
                notes.append(note)
            
            return notes
            
        except sqlite3.Error as e:
            raise Exception(f"Ошибка при получении заметок: {e}")
    
    def get_by_id(self, note_id: int) -> Optional[Note]:
        """
        Получает заметку по ID.
        
        Args:
            note_id: ID заметки
            
        Returns:
            Заметка или None, если не найдена
        """
        try:
            query = "SELECT id, text, created_at FROM notes WHERE id = ?"
            rows = execute_query(query, (note_id,))
            
            if not rows:
                return None
            
            row = rows[0]
            return Note(
                id=row['id'],
                text=row['text'],
                created_at=datetime.fromisoformat(row['created_at']) if row['created_at'] else None
            )
            
        except sqlite3.Error as e:
            raise Exception(f"Ошибка при получении заметки с ID {note_id}: {e}")
    
    def create(self, note: Note) -> Note:
        """
        Создает новую заметку в базе данных.
        
        Args:
            note: Объект заметки для создания
            
        Returns:
            Созданная заметка с присвоенным ID
        """
        try:
            query = "INSERT INTO notes (text, created_at) VALUES (?, ?)"
            created_at = datetime.now()
            note_id = execute_query(query, (note.text, created_at.isoformat()))
            
            return Note(
                id=note_id,
                text=note.text,
                created_at=created_at
            )
            
        except sqlite3.Error as e:
            raise Exception(f"Ошибка при создании заметки: {e}")
    
    def update(self, note_id: int, note: Note) -> Optional[Note]:
        """
        Обновляет существующую заметку.
        
        Args:
            note_id: ID заметки для обновления
            note: Новые данные заметки
            
        Returns:
            Обновленная заметка или None, если заметка не найдена
        """
        try:
            # Проверяем, существует ли заметка
            existing_note = self.get_by_id(note_id)
            if not existing_note:
                return None
            
            query = "UPDATE notes SET text = ? WHERE id = ?"
            execute_query(query, (note.text, note_id))
            
            # Возвращаем обновленную заметку
            return self.get_by_id(note_id)
            
        except sqlite3.Error as e:
            raise Exception(f"Ошибка при обновлении заметки с ID {note_id}: {e}")
    
    def delete(self, note_id: int) -> bool:
        """
        Удаляет заметку по ID.
        
        Args:
            note_id: ID заметки для удаления
            
        Returns:
            True, если заметка была удалена, False если не найдена
        """
        try:
            # Проверяем, существует ли заметка
            existing_note = self.get_by_id(note_id)
            if not existing_note:
                return False
            
            query = "DELETE FROM notes WHERE id = ?"
            execute_query(query, (note_id,))
            
            return True
            
        except sqlite3.Error as e:
            raise Exception(f"Ошибка при удалении заметки с ID {note_id}: {e}")
    
    def count(self) -> int:
        """
        Возвращает общее количество заметок.
        
        Returns:
            Количество заметок в базе данных
        """
        try:
            query = "SELECT COUNT(*) as count FROM notes"
            rows = execute_query(query)
            return rows[0]['count'] if rows else 0
            
        except sqlite3.Error as e:
            raise Exception(f"Ошибка при подсчете заметок: {e}")