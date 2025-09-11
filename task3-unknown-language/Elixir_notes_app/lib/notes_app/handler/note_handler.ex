defmodule NotesApp.Handler.NoteHandler do
  @moduledoc """
  HTTP обработчики для endpoints управления заметками.
  Обрабатывает JSON запросы и ответы, валидацию и ошибки.
  """

  import Plug.Conn
  alias NotesApp.Service.NoteService

  @doc """
  GET /notes - получить все заметки
  """
  def list_notes(conn) do
    notes = NoteService.list_notes()
    
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(200, Jason.encode!(%{notes: notes}))
  end

  @doc """
  POST /notes - создать новую заметку
  """
  def create_note(conn) do
    case parse_json_body(conn) do
      {:ok, body} ->
        case NoteService.create_note(body) do
          {:ok, note} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(201, Jason.encode!(note))
          
          {:error, reason} ->
            send_error(conn, 400, reason)
        end
      
      {:error, reason} ->
        send_error(conn, 400, reason)
    end
  end

  @doc """
  PUT /notes/:id - обновить заметку
  """
  def update_note(conn, id) do
    case parse_json_body(conn) do
      {:ok, body} ->
        case NoteService.update_note(id, body) do
          {:ok, note} ->
            conn
            |> put_resp_content_type("application/json")
            |> send_resp(200, Jason.encode!(note))
          
          {:error, :not_found} ->
            send_error(conn, 404, "Note not found")
          
          {:error, :invalid_id} ->
            send_error(conn, 400, "Invalid note ID")
          
          {:error, reason} ->
            send_error(conn, 400, reason)
        end
      
      {:error, reason} ->
        send_error(conn, 400, reason)
    end
  end

  @doc """
  DELETE /notes/:id - удалить заметку
  """
  def delete_note(conn, id) do
    case NoteService.delete_note(id) do
      {:ok, _note} ->
        conn
        |> send_resp(204, "")
      
      {:error, :not_found} ->
        send_error(conn, 404, "Note not found")
      
      {:error, :invalid_id} ->
        send_error(conn, 400, "Invalid note ID")
      
      {:error, reason} ->
        send_error(conn, 500, reason)
    end
  end

  # Приватные функции

  defp parse_json_body(conn) do
    case read_body(conn) do
      {:ok, body, _conn} ->
        case Jason.decode(body) do
          {:ok, json} -> {:ok, json}
          {:error, _} -> {:error, "Invalid JSON"}
        end
      
      {:error, _} ->
        {:error, "Failed to read request body"}
    end
  end

  defp send_error(conn, status, message) do
    error_response = %{error: message}
    
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(status, Jason.encode!(error_response))
  end
end