package middlewares

import (
	"log"
	"net/http"
)

// CORSMiddleware añade los encabezados necesarios para permitir CORS.
func CORSMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Permitir solicitudes desde cualquier origen; puedes restringirlo a http://localhost:3000
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		// Si el método es OPTIONS, finaliza la petición sin llamar al siguiente handler
		if r.Method == "OPTIONS" {
			log.Printf("Preflight OPTIONS request recibida en %s", r.URL.Path)
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
