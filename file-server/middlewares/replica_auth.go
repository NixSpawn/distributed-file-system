package middlewares

import (
	"net/http"
	"strings"

	"github.com/t-saturn/file-server/config"
)

// ReplicaAuthMiddleware verifica el token de autenticación para las rutas de replicación.
func ReplicaAuthMiddleware(cfg config.Config) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if cfg.ReplicaAuthToken == "" {
				http.Error(w, "Servidor de réplica no configurado para autenticación", http.StatusInternalServerError)
				return
			}

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "No autorizado", http.StatusUnauthorized)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "Formato de token inválido", http.StatusUnauthorized)
				return
			}

			token := parts[1]
			if token != cfg.ReplicaAuthToken {
				http.Error(w, "Token inválido", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
