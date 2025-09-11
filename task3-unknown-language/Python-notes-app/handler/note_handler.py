"""
HTTP обработчики для эндпоинтов управления заметками.
Содержит обработчики для GET, POST, PUT, DELETE операций.
"""

from flask import Blueprint, request, jsonify
from service.note_service import NoteService


# Создаем Blueprint для маршрутов заметок
note_bp = Blueprint('notes', __name__)
note_service = NoteService()


@note_bp.route('/notes', methods=['GET'])
def get_all_notes():
    """
    GET /notes - получить все заметки.
    
    Returns:
        JSON ответ со списком всех заметок
    """
    try:
        notes, error = note_service.get_all_notes()
        
        if error:
            return jsonify({
                'error': error,
                'message': 'Ошибка при получении заметок'
            }), 500
        
        # Преобразуем заметки в словари для JSON сериализации
        notes_data = [note.to_dict() for note in notes]
        
        return jsonify({
            'notes': notes_data,
            'count': len(notes_data),
            'message': 'Заметки получены успешно'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Внутренняя ошибка сервера'
        }), 500


@note_bp.route('/notes/<int:note_id>', methods=['GET'])
def get_note_by_id(note_id):
    """
    GET /notes/{id} - получить заметку по ID.
    
    Args:
        note_id: ID заметки
        
    Returns:
        JSON ответ с заметкой или ошибкой
    """
    try:
        note, error = note_service.get_note_by_id(note_id)
        
        if error:
            if "не найдена" in error:
                return jsonify({
                    'error': error,
                    'message': 'Заметка не найдена'
                }), 404
            else:
                return jsonify({
                    'error': error,
                    'message': 'Ошибка при получении заметки'
                }), 400
        
        return jsonify({
            'note': note.to_dict(),
            'message': 'Заметка получена успешно'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Внутренняя ошибка сервера'
        }), 500


@note_bp.route('/notes', methods=['POST'])
def create_note():
    """
    POST /notes - создать новую заметку.
    
    Ожидает JSON с полем 'text'.
    
    Returns:
        JSON ответ с созданной заметкой или ошибкой
    """
    try:
        # Проверяем Content-Type
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type должен быть application/json',
                'message': 'Неверный формат запроса'
            }), 400
        
        # Получаем данные из запроса
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Тело запроса не может быть пустым',
                'message': 'Отсутствуют данные'
            }), 400
        
        # Создаем заметку
        note, error = note_service.create_note(data)
        
        if error:
            return jsonify({
                'error': error,
                'message': 'Ошибка валидации данных'
            }), 400
        
        return jsonify({
            'note': note.to_dict(),
            'message': 'Заметка создана успешно'
        }), 201
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Внутренняя ошибка сервера'
        }), 500


@note_bp.route('/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """
    PUT /notes/{id} - обновить заметку по ID.
    
    Args:
        note_id: ID заметки для обновления
        
    Ожидает JSON с полем 'text'.
    
    Returns:
        JSON ответ с обновленной заметкой или ошибкой
    """
    try:
        # Проверяем Content-Type
        if not request.is_json:
            return jsonify({
                'error': 'Content-Type должен быть application/json',
                'message': 'Неверный формат запроса'
            }), 400
        
        # Получаем данные из запроса
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'Тело запроса не может быть пустым',
                'message': 'Отсутствуют данные'
            }), 400
        
        # Обновляем заметку
        note, error = note_service.update_note(note_id, data)
        
        if error:
            if "не найдена" in error:
                return jsonify({
                    'error': error,
                    'message': 'Заметка не найдена'
                }), 404
            else:
                return jsonify({
                    'error': error,
                    'message': 'Ошибка при обновлении заметки'
                }), 400
        
        return jsonify({
            'note': note.to_dict(),
            'message': 'Заметка обновлена успешно'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Внутренняя ошибка сервера'
        }), 500


@note_bp.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """
    DELETE /notes/{id} - удалить заметку по ID.
    
    Args:
        note_id: ID заметки для удаления
        
    Returns:
        JSON ответ с результатом операции
    """
    try:
        success, error = note_service.delete_note(note_id)
        
        if error:
            if "не найдена" in error:
                return jsonify({
                    'error': error,
                    'message': 'Заметка не найдена'
                }), 404
            else:
                return jsonify({
                    'error': error,
                    'message': 'Ошибка при удалении заметки'
                }), 400
        
        return jsonify({
            'message': f'Заметка с ID {note_id} удалена успешно'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Внутренняя ошибка сервера'
        }), 500


@note_bp.route('/notes/count', methods=['GET'])
def get_notes_count():
    """
    GET /notes/count - получить количество заметок.
    
    Returns:
        JSON ответ с количеством заметок
    """
    try:
        count, error = note_service.get_notes_count()
        
        if error:
            return jsonify({
                'error': error,
                'message': 'Ошибка при подсчете заметок'
            }), 500
        
        return jsonify({
            'count': count,
            'message': 'Количество заметок получено успешно'
        }), 200
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'message': 'Внутренняя ошибка сервера'
        }), 500


@note_bp.errorhandler(404)
def not_found(error):
    """Обработчик ошибки 404."""
    return jsonify({
        'error': 'Эндпоинт не найден',
        'message': 'Запрашиваемый ресурс не существует'
    }), 404


@note_bp.errorhandler(405)
def method_not_allowed(error):
    """Обработчик ошибки 405."""
    return jsonify({
        'error': 'Метод не разрешен',
        'message': 'Данный HTTP метод не поддерживается для этого эндпоинта'
    }), 405


@note_bp.errorhandler(500)
def internal_error(error):
    """Обработчик внутренних ошибок сервера."""
    return jsonify({
        'error': 'Внутренняя ошибка сервера',
        'message': 'Произошла непредвиденная ошибка'
    }), 500