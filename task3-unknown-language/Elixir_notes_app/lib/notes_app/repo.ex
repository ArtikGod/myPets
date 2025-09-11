defmodule NotesApp.Repo do
  use Ecto.Repo,
    otp_app: :notes_app,
    adapter: Ecto.Adapters.SQLite3

  def init(_type, config) do
    # Создаем базу данных и таблицы при запуске
    database_path = Keyword.get(config, :database)
    
    # Создаем директорию если её нет
    database_path
    |> Path.dirname()
    |> File.mkdir_p!()

    {:ok, config}
  end
end