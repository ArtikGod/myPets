defmodule NotesApp.Service.NoteService do
  @moduledoc """
  Сервисный слой для работы с заметками.
  Содержит бизнес-логику и взаимодействует с репозиторием.
  """

  alias NotesApp.Repository.NoteRepository

  @doc """
  Получает все заметки.
  Возвращает список заметок.
  """
  def list_notes do
    NoteRepository.get_all_notes()
  end

  @doc """
  Получает заметку по ID.
  Возвращает {:ok, note} если найдена, {:error, :not_found} если не найдена.
  """
  def get_note(id) when is_binary(id) do
    case Integer.parse(id) do
      {parsed_id, ""} -> get_note(parsed_id)
      _ -> {:error, :invalid_id}
    end
  end

  def get_note(id) when is_integer(id) do
    NoteRepository.get_note_by_id(id)
  end

  @doc """
  Создает новую заметку.
  Возвращает {:ok, note} при успехе, {:error, reason} при ошибке.
  """
  def create_note(attrs) do
    case validate_note_attrs(attrs) do
      :ok ->
        case NoteRepository.create_note(attrs) do
          {:ok, note} -> {:ok, note}
          {:error, changeset} -> {:error, format_changeset_errors(changeset)}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Обновляет существующую заметку.
  Возвращает {:ok, note} при успехе, {:error, reason} при ошибке.
  """
  def update_note(id, attrs) do
    with {:ok, note} <- get_note(id),
         :ok <- validate_note_attrs(attrs) do
      case NoteRepository.update_note(note, attrs) do
        {:ok, updated_note} -> {:ok, updated_note}
        {:error, changeset} -> {:error, format_changeset_errors(changeset)}
      end
    end
  end

  @doc """
  Удаляет заметку по ID.
  Возвращает {:ok, note} при успехе, {:error, reason} при ошибке.
  """
  def delete_note(id) do
    with {:ok, note} <- get_note(id) do
      case NoteRepository.delete_note(note) do
        {:ok, deleted_note} -> {:ok, deleted_note}
        {:error, changeset} -> {:error, format_changeset_errors(changeset)}
      end
    end
  end

  # Приватные функции

  defp validate_note_attrs(%{"text" => text}) when is_binary(text) do
    cond do
      String.trim(text) == "" -> {:error, "Text cannot be empty"}
      String.length(text) > 500 -> {:error, "Text must be 500 characters or less"}
      String.length(text) < 1 -> {:error, "Text must be at least 1 character"}
      true -> :ok
    end
  end

  defp validate_note_attrs(_), do: {:error, "Text field is required"}

  defp format_changeset_errors(changeset) do
    changeset.errors
    |> Enum.map(fn {field, {message, _}} -> "#{field}: #{message}" end)
    |> Enum.join(", ")
  end
end