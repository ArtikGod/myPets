defmodule NotesApp do
  @moduledoc """
  NotesApp - RESTful веб-приложение для управления заметками.
  
  Приложение предоставляет HTTP API для выполнения CRUD операций с заметками:
  - GET /notes - получить все заметки
  - POST /notes - создать новую заметку
  - PUT /notes/:id - обновить заметку
  - DELETE /notes/:id - удалить заметку
  
  Использует SQLite в качестве базы данных и включает валидацию входных данных.
  """

  @doc """
  Запускает приложение.
  """
  def start do
    Application.start(:notes_app)
  end

  @doc """
  Останавливает приложение.
  """
  def stop do
    Application.stop(:notes_app)
  end
end