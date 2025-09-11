defmodule NotesApp.Repository.NoteRepository do
  @moduledoc """
  Репозиторий для работы с заметками в базе данных.
  Содержит все операции CRUD для сущности Note.
  """

  import Ecto.Query
  alias NotesApp.Repo
  alias NotesApp.Model.Note

  @doc """
  Получает все заметки из базы данных, отсортированные по дате создания (новые первыми).
  """
  def get_all_notes do
    Note
    |> order_by(desc: :created_at)
    |> Repo.all()
  end

  @doc """
  Получает заметку по ID.
  Возвращает {:ok, note} если найдена, {:error, :not_found} если не найдена.
  """
  def get_note_by_id(id) do
    case Repo.get(Note, id) do
      nil -> {:error, :not_found}
      note -> {:ok, note}
    end
  end

  @doc """
  Создает новую заметку.
  Возвращает {:ok, note} при успехе, {:error, changeset} при ошибке валидации.
  """
  def create_note(attrs) do
    %Note{}
    |> Note.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Обновляет существующую заметку.
  Возвращает {:ok, note} при успехе, {:error, changeset} при ошибке валидации.
  """
  def update_note(note, attrs) do
    note
    |> Note.update_changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Удаляет заметку.
  Возвращает {:ok, note} при успехе, {:error, changeset} при ошибке.
  """
  def delete_note(note) do
    Repo.delete(note)
  end

  @doc """
  Проверяет существование заметки по ID.
  """
  def note_exists?(id) do
    Note
    |> where([n], n.id == ^id)
    |> Repo.exists?()
  end
end