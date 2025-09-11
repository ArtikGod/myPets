"""
Главный файл приложения для управления заметками.
Инициализирует сервер, базу данных и маршрутизатор.
"""

from flask import Flask
from db.database import init_database
from handler.note_handler import note_bp


def create_app():
    """Создает и настраивает Flask приложение."""
    app = Flask(__name__)
    
    # Инициализация базы данных
    init_database()
    
    # Регистрация blueprint'ов
    app.register_blueprint(note_bp, url_prefix='/api')
    
    return app


if __name__ == '__main__':
    app = create_app()
    print("Запуск сервера на http://localhost:8000")
    app.run(debug=True, host='0.0.0.0', port=8000)