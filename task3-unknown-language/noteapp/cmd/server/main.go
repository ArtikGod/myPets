package main

import (
	"log"
	"net/http"
	"noteapp/internal/db"
	"noteapp/internal/handler"
	"noteapp/internal/repository"
	"noteapp/internal/service"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func main() {
	// Инициализация базы данных
	database, err := db.NewSQLiteDB("notes.db")
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Создание схемы базы данных
	if err := database.InitSchema(); err != nil {
		log.Fatalf("Failed to initialize database schema: %v", err)
	}

	// Инициализация слоев приложения
	noteRepo := repository.NewNoteRepository(database.DB)
	noteService := service.NewNoteService(noteRepo)
	noteHandler := handler.NewNoteHandler(noteService)

	// Настройка роутера
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)

	// CORS middleware для разработки
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-CSRF-Token")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next.ServeHTTP(w, r)
		})
	})

	// Маршруты API
	r.Route("/notes", func(r chi.Router) {
		r.Get("/", noteHandler.GetAllNotes)      // GET /notes
		r.Post("/", noteHandler.CreateNote)      // POST /notes
		r.Put("/{id}", noteHandler.UpdateNote)   // PUT /notes/{id}
		r.Delete("/{id}", noteHandler.DeleteNote) // DELETE /notes/{id}
	})

	// Health check endpoint
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	// Запуск сервера
	port := ":8080"
	log.Printf("Starting server on port %s", port)
	log.Printf("Available endpoints:")
	log.Printf("  GET    /notes       - Get all notes")
	log.Printf("  POST   /notes       - Create a new note")
	log.Printf("  PUT    /notes/{id}  - Update a note")
	log.Printf("  DELETE /notes/{id}  - Delete a note")
	log.Printf("  GET    /health      - Health check")

	if err := http.ListenAndServe(port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}