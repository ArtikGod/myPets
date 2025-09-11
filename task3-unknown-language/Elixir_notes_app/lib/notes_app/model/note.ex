defmodule NotesApp.Model.Note do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :integer, autogenerate: true}
  @derive {Jason.Encoder, only: [:id, :text, :created_at]}

  schema "notes" do
    field :text, :string
    field :created_at, :utc_datetime, default: DateTime.utc_now()
  end

  @doc """
  Создает changeset для валидации данных заметки.
  Валидирует что текст не пустой и содержит от 1 до 500 символов.
  """
  def changeset(note, attrs) do
    note
    |> cast(attrs, [:text])
    |> validate_required([:text])
    |> validate_length(:text, min: 1, max: 500, message: "Text must be between 1 and 500 characters")
    |> put_change(:created_at, DateTime.utc_now())
  end

  @doc """
  Создает changeset для обновления заметки.
  """
  def update_changeset(note, attrs) do
    note
    |> cast(attrs, [:text])
    |> validate_required([:text])
    |> validate_length(:text, min: 1, max: 500, message: "Text must be between 1 and 500 characters")
  end
end