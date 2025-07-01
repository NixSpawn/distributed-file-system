package routes

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/t-saturn/file-server/config"
	"github.com/t-saturn/file-server/controllers"
	"github.com/t-saturn/file-server/middlewares"
	"github.com/t-saturn/file-server/services"
)

// FileMiddleware es un middleware que procesa solicitudes relacionadas con archivos.
// Verifica el token JWT si está presente y lo inyecta en el contexto.
func FileMiddleware(cfg config.Config, fileService *services.FileService) mux.MiddlewareFunc {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Si hay header Authorization, valida el token JWT
			if r.Header.Get("Authorization") != "" {
				authHandler := middlewares.AuthMiddleware(cfg, fileService.LogRepo)(next)
				authHandler.ServeHTTP(w, r)
				return
			}
			// Si no hay token, continúa sin autenticación (para archivos públicos)
			next.ServeHTTP(w, r)
		})
	}
}

func SetupRoutes(fileService *services.FileService) *mux.Router {
	cfg := config.LoadConfig()

	// Creamos el controlador de archivos con el servicio, URL base, repositorio y ruta de almacenamiento.
	fileController := controllers.NewFileController(fileService, cfg.FileBaseURL)

	router := mux.NewRouter()
	router.Use(middlewares.CORSMiddleware)

	// Subrouter para la API con autenticación JWT obligatoria.
	api := router.PathPrefix("/api").Subrouter()
	api.Use(middlewares.AuthMiddleware(cfg, fileService.LogRepo))

	// Endpoint para subir archivos.
	api.HandleFunc("/file/upload/{project}", fileController.UploadFileHandler).Methods("POST")
	api.HandleFunc("/file/upload/{project}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para actualizar un archivo por su ID.
	api.HandleFunc("/file/{id}", fileController.UpdateFileHandler).Methods("PUT")
	api.HandleFunc("/file/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para actualizar visibilidad de un archivo.
	api.HandleFunc("/file/{id}/visibility", fileController.UpdateFileVisibilityHandler).Methods("PUT")
	api.HandleFunc("/file/{id}/visibility", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para obtener información de un archivo por su ID.
	api.HandleFunc("/file/{id}", fileController.GetFileHandler).Methods("GET")
	api.HandleFunc("/file/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para eliminar archivos por ID.
	api.HandleFunc("/file/{id}", fileController.DeleteFileHandler).Methods("DELETE")
	api.HandleFunc("/file/{id}", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para agregar permisos a un archivo.
	api.HandleFunc("/file/{id}/permissions", fileController.AddFilePermissionHandler).Methods("POST")
	api.HandleFunc("/file/{id}/permissions", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para actualizar permisos de un archivo.
	api.HandleFunc("/file/{id}/permissions", fileController.UpdateFilePermissionsHandler).Methods("PUT")
	api.HandleFunc("/file/{id}/permissions", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Endpoint para eliminar permisos de un archivo.
	api.HandleFunc("/file/{id}/permissions", fileController.DeleteFilePermissionHandler).Methods("DELETE")
	api.HandleFunc("/file/{id}/permissions", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}).Methods("OPTIONS")

	// Ruta para servir archivos (usa FileMiddleware para verificar JWT cuando sea necesario).
	filesRouter := router.PathPrefix("/files").Subrouter()
	filesRouter.Use(FileMiddleware(cfg, fileService))
	filesRouter.HandleFunc("/{id}", fileController.ServeFileHandler).Methods("GET")

	// Ruta de bienvenida.
	router.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Server running successfully",
		})
	}).Methods("GET")

	// Subrouter para rutas internas de replicación
	internal := router.PathPrefix("/internal").Subrouter()
	internal.Use(middlewares.ReplicaAuthMiddleware(cfg))

	// Endpoint interno para subir archivos replicados
	internal.HandleFunc("/upload/{project}", fileController.InternalUploadFileHandler).Methods("POST")

	// Endpoint interno para eliminar archivos replicados
	internal.HandleFunc("/delete/{id}", fileController.InternalDeleteFileHandler).Methods("DELETE")

	return router
}
