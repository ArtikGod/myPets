defmodule NotesApp.DB do
  @moduledoc """
  Модуль для настройки и инициализации SQLite базы данных.
  Обеспечивает создание таблиц при запуске приложения.
  """

  require Logger
  alias NotesApp.Repo

  @doc """
  Инициализирует базу данных и выполняет миграции.
  Вызывается при запуске приложения.
  """
  def setup do
    Logger.info("Initializing database...")
    
    # Создаем базу данных если её нет
    case Repo.__adapter__.storage_up(Repo.config()) do
      :ok -> 
        Logger.info("Database created successfully")
      {:error, :already_up} -> 
        Logger.info("Database already exists")
      {:error, reason} -> 
        Logger.error("Failed to create database: #{inspect(reason)}")
        raise "Database setup failed"
    end

    # Выполняем миграции
    migrate()
  end

  @doc """
  Выполняет все миграции.
  """
  def migrate do
    Logger.info("Running migrations...")
    
    migrations_path = Application.app_dir(:notes_app, "priv/repo/migrations")
    
    case File.exists?(migrations_path) do
      true ->
        Ecto.Migrator.run(Repo, migrations_path, :up, all: true)
        Logger.info("Migrations completed successfully")
      false ->
        Logger.warning("Migrations directory not found, creating tables manually...")
        create_tables_manually()
    end
  end

  # Создание таблиц вручную если миграции недоступны
  defp create_tables_manually do
    Logger.info("Creating notes table manually...")
    
    sql = """
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
    """
    
    case Repo.query(sql) do
      {:ok, _} -> 
        Logger.info("Notes table created successfully")
      {:error, reason} -> 
        Logger.error("Failed to create notes table: #{inspect(reason)}")
        raise "Table creation failed"
    end
  end
end