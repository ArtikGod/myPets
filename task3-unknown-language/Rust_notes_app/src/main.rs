mod database;
mod handlers;
mod models;
mod repository;
mod services;

use database::create_pool;
use handlers::NoteHandlers;
use models::{CreateNoteRequest, UpdateNoteRequest};
use repository::NoteRepository;
use services::NoteService;
use std::convert::Infallible;
use uuid::Uuid;
use warp::{filters::BoxedFilter, Filter, Reply};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Инициализация базы данных
    let database_url = "sqlite:notes.db";
    let pool = create_pool(database_url).await?;

    // Создание слоев приложения
    let repository = NoteRepository::new(pool);
    let service = NoteService::new(repository);
    let handlers = NoteHandlers::new(service);

    // Настройка маршрутов
    let routes = create_routes(handlers);

    println!("Сервер запущен на http://localhost:3030");
    println!("Доступные эндпоинты:");
    println!("  GET    /notes       - получить все заметки");
    println!("  POST   /notes       - создать заметку");
    println!("  GET    /notes/:id   - получить заметку по ID");
    println!("  PUT    /notes/:id   - обновить заметку");
    println!("  DELETE /notes/:id   - удалить заметку");

    warp::serve(routes).run(([127, 0, 0, 1], 3030)).await;

    Ok(())
}

fn create_routes(handlers: NoteHandlers) -> BoxedFilter<(impl Reply,)> {
    let cors = warp::cors()
        .allow_any_origin()
        .allow_headers(vec!["content-type"])
        .allow_methods(vec!["GET", "POST", "PUT", "DELETE"]);

    // GET /notes - получить все заметки
    let get_notes = warp::path("notes")
        .and(warp::path::end())
        .and(warp::get())
        .and(with_handlers(handlers.clone()))
        .and_then(|handlers: NoteHandlers| async move {
            handlers.get_all_notes().await
        });

    // POST /notes - создать заметку
    let create_note = warp::path("notes")
        .and(warp::path::end())
        .and(warp::post())
        .and(warp::body::json())
        .and(with_handlers(handlers.clone()))
        .and_then(|request: CreateNoteRequest, handlers: NoteHandlers| async move {
            handlers.create_note(request).await
        });

    // GET /notes/:id - получить заметку по ID
    let get_note = warp::path("notes")
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(warp::get())
        .and(with_handlers(handlers.clone()))
        .and_then(|id: Uuid, handlers: NoteHandlers| async move {
            handlers.get_note_by_id(id).await
        });

    // PUT /notes/:id - обновить заметку
    let update_note = warp::path("notes")
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(warp::put())
        .and(warp::body::json())
        .and(with_handlers(handlers.clone()))
        .and_then(|id: Uuid, request: UpdateNoteRequest, handlers: NoteHandlers| async move {
            handlers.update_note(id, request).await
        });

    // DELETE /notes/:id - удалить заметку
    let delete_note = warp::path("notes")
        .and(warp::path::param::<Uuid>())
        .and(warp::path::end())
        .and(warp::delete())
        .and(with_handlers(handlers.clone()))
        .and_then(|id: Uuid, handlers: NoteHandlers| async move {
            handlers.delete_note(id).await
        });

    get_notes
        .or(create_note)
        .or(get_note)
        .or(update_note)
        .or(delete_note)
        .with(cors)
        .boxed()
}

fn with_handlers(
    handlers: NoteHandlers,
) -> impl Filter<Extract = (NoteHandlers,), Error = Infallible> + Clone {
    warp::any().map(move || handlers.clone())
}