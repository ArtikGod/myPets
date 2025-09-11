"""
Сервисный слой для бизнес-логики работы с заметками.
Содержит методы для CRUD операций с валидацией и обработкой ошибок.
"""

from typing import List, Optional, Tuple
from model.note import Note
from repository.note_repository import NoteRepository


class NoteService:
    """Сервис для работы с заметками."""
    
    def __init__(self):
        self.repository = NoteRepository()
    
    def get_all_notes(self) -> Tuple[List[Note], Optional[str]]:
        """
        Получает все заметки.
        
        Returns:
            Кортеж (список заметок, сообщение об ошибке)
        """
        try:
            notes = self.repository.get_all()
            return notes, None
        except Exception as e:
            return [], str(e)
    
    def get_note_by_id(self, note_id: int) -> Tuple[Optional[Note], Optional[str]]:
        """
        Получает заметку по ID.
        
        Args:
            note_id: ID заметки
            
        Returns:
            Кортеж (заметка или None, сообщение об ошибке)
        """
        try:
            if note_id <= 0:
                return None, "ID заметки должен быть положительным числом"
            
            note = self.repository.get_by_id(note_id)
            if not note:
                return None, f"Заметка с ID {note_id} не найдена"
            
            return note, None
        except Exception as e:
            return None, str(e)
    
    def create_note(self, note_data: dict) -> Tuple[Optional[Note], Optional[str]]:
        """
        Создает новую заметку.
        
        Args:
            note_data: Словарь с данными заметки
            
        Returns:
            Кортеж (созданная заметка или None, сообщение об ошибке)
        """
        try:
            # Создаем объект заметки из данных
            note = Note.from_dict(note_data)
            
            # Валидируем заметку
            validation_errors = note.validate()
            if validation_errors:
                return None, "; ".join(validation_errors)
            
            # Создаем заметку в базе данных
            created_note = self.repository.create(note)
            return created_note, None
            
        except KeyError as e:
            return None, f"Отсутствует обязательное поле: {e}"
        except Exception as e:
            return None, str(e)
    
    def update_note(self, note_id: int, note_data: dict) -> Tuple[Optional[Note], Optional[str]]:
        """
        Обновляет существующую заметку.
        
        Args:
            note_id: ID заметки для обновления
            note_data: Новые данные заметки
            
        Returns:
            Кортеж (обновленная заметка или None, сообщение об ошибке)
        """
        try:
            if note_id <= 0:
                return None, "ID заметки должен быть положительным числом"
            
            # Проверяем, существует ли заметка
            existing_note, error = self.get_note_by_id(note_id)
            if error:
                return None, error
            
            # Создаем объект заметки из новых данных
            note = Note.from_dict(note_data)
            
            # Валидируем заметку
            validation_errors = note.validate()
            if validation_errors:
                return None, "; ".join(validation_errors)
            
            # Обновляем заметку в базе данных
            updated_note = self.repository.update(note_id, note)
            if not updated_note:
                return None, f"Не удалось обновить заметку с ID {note_id}"
            
            return updated_note, None
            
        except KeyError as e:
            return None, f"Отсутствует обязательное поле: {e}"
        except Exception as e:
            return None, str(e)
    
    def delete_note(self, note_id: int) -> Tuple[bool, Optional[str]]:
        """
        Удаляет заметку по ID.
        
        Args:
            note_id: ID заметки для удаления
            
        Returns:
            Кортеж (успешность операции, сообщение об ошибке)
        """
        try:
            if note_id <= 0:
                return False, "ID заметки должен быть положительным числом"
            
            # Проверяем, существует ли заметка
            existing_note, error = self.get_note_by_id(note_id)
            if error:
                return False, error
            
            # Удаляем заметку
            success = self.repository.delete(note_id)
            if not success:
                return False, f"Не удалось удалить заметку с ID {note_id}"
            
            return True, None
            
        except Exception as e:
            return False, str(e)
    
    def get_notes_count(self) -> Tuple[int, Optional[str]]:
        """
        Получает общее количество заметок.
        
        Returns:
            Кортеж (количество заметок, сообщение об ошибке)
        """
        try:
            count = self.repository.count()
            return count, None
        except Exception as e:
            return 0, str(e)
    
    def validate_note_data(self, data: dict) -> List[str]:
        """
        Валидирует данные заметки без создания объекта.
        
        Args:
            data: Словарь с данными для валидации
            
        Returns:
            Список ошибок валидации
        """
        errors = []
        
        if 'text' not in data:
            errors.append("Отсутствует поле 'text'")
            return errors
        
        text = data['text']
        if not text or not str(text).strip():
            errors.append("Текст заметки не может быть пустым")
        elif len(str(text).strip()) > 500:
            errors.append("Текст заметки не может превышать 500 символов")
        elif len(str(text).strip()) < 1:
            errors.append("Текст заметки должен содержать минимум 1 символ")
        
        return errors