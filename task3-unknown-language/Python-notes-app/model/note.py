"""
Модель данных для заметки.
Определяет структуру Note с полями ID, Text и CreatedAt.
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Note:
    """Модель заметки."""
    id: Optional[int]
    text: str
    created_at: Optional[datetime] = None
    
    def to_dict(self) -> dict:
        """Преобразует объект Note в словарь для JSON сериализации."""
        return {
            'id': self.id,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Note':
        """Создает объект Note из словаря."""
        created_at = None
        if data.get('created_at'):
            if isinstance(data['created_at'], str):
                created_at = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            else:
                created_at = data['created_at']
        
        return cls(
            id=data.get('id'),
            text=data['text'],
            created_at=created_at
        )
    
    def validate(self) -> list[str]:
        """Валидирует данные заметки. Возвращает список ошибок."""
        errors = []
        
        if not self.text or not self.text.strip():
            errors.append("Текст заметки не может быть пустым")
        elif len(self.text.strip()) > 500:
            errors.append("Текст заметки не может превышать 500 символов")
        elif len(self.text.strip()) < 1:
            errors.append("Текст заметки должен содержать минимум 1 символ")
            
        return errors