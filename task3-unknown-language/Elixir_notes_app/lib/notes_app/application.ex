defmodule NotesApp.Application do
  @moduledoc false

  use Application
  require Logger

  @impl true
  def start(_type, _args) do
    # Инициализируем базу данных
    NotesApp.DB.setup()

    children = [
      NotesApp.Repo,
      {Plug.Cowboy, scheme: :http, plug: NotesApp.Router, options: [port: 4000]}
    ]

    opts = [strategy: :one_for_one, name: NotesApp.Supervisor]
    
    case Supervisor.start_link(children, opts) do
      {:ok, pid} ->
        Logger.info("NotesApp started successfully on port 4000")
        {:ok, pid}
      error ->
        Logger.error("Failed to start NotesApp: #{inspect(error)}")
        error
    end
  end
end