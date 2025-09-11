defmodule NotesApp.Router do
  @moduledoc """
  HTTP роутер для обработки запросов к API заметок.
  Определяет маршруты и связывает их с соответствующими обработчиками.
  """

  use Plug.Router
  alias NotesApp.Handler.NoteHandler

  plug Plug.Logger
  plug :match
  plug Plug.Parsers, parsers: [:json], json_decoder: Jason
  plug :dispatch

  # GET /notes - получить все заметки
  get "/notes" do
    NoteHandler.list_notes(conn)
  end

  # POST /notes - создать новую заметку
  post "/notes" do
    NoteHandler.create_note(conn)
  end

  # PUT /notes/:id - обновить заметку
  put "/notes/:id" do
    NoteHandler.update_note(conn, id)
  end

  # DELETE /notes/:id - удалить заметку
  delete "/notes/:id" do
    NoteHandler.delete_note(conn, id)
  end

  # Обработка несуществующих маршрутов
  match _ do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, Jason.encode!(%{error: "Not found"}))
  end
end