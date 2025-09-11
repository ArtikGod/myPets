import Config

config :notes_app, NotesApp.Repo,
  database: "notes.db",
  pool_size: 5

config :notes_app,
  ecto_repos: [NotesApp.Repo]

config :logger, level: :info