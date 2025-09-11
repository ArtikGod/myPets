"""
Модуль для настройки подключения к SQLite базе данных.
Содержит функции для инициализации БД и создания таблиц.
"""

import sqlite3
import os
from datetime import datetime
from typing import Optional


DATABASE_PATH = 'notes.db'


def get_connection() -> sqlite3.Connection:
    """Создает и возвращает подключение к базе данных."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # Позволяет обращаться к колонкам по имени
    return conn


def init_database() -> None:
    """Инициализирует базу данных и создает необходимые таблицы."""
    conn = get_connection()
    try:
        cursor = conn.cursor()
        
        # Создание таблицы notes
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        print("База данных инициализирована успешно")
        
    except sqlite3.Error as e:
        print(f"Ошибка при инициализации базы данных: {e}")
        raise
    finally:
        conn.close()


def execute_query(query: str, params: tuple = ()) -> Optional[list]:
    """
    Выполняет SQL запрос и возвращает результат.
    
    Args:
        query: SQL запрос
        params: Параметры для запроса
        
    Returns:
        Список результатов для SELECT запросов, None для других
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(query, params)
        
        if query.strip().upper().startswith('SELECT'):
            return cursor.fetchall()
        else:
            conn.commit()
            return cursor.lastrowid
            
    except sqlite3.Error as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def execute_many(query: str, params_list: list) -> None:
    """
    Выполняет SQL запрос с множественными параметрами.
    
    Args:
        query: SQL запрос
        params_list: Список параметров для запроса
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.executemany(query, params_list)
        conn.commit()
    except sqlite3.Error as e:
        conn.rollback()
        raise e
    finally:
        conn.close()