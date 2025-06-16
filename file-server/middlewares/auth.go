package middlewares

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
	"github.com/t-saturn/file-server/config"
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/utils"
)

// CustomClaims define los claims personalizados, incluyendo los registrados.
type CustomClaims struct {
	User string `json:"user"`
	jwt.RegisteredClaims
}

// AuthMiddleware valida el token JWT y extrae el claim "user".
func AuthMiddleware(cfg config.Config, logRepo *database.LogRepository) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				msg := "No existe token"

				utils.Logger.WithFields(logrus.Fields{
					"event": "login",
					"ip":    ip,
				}).Error(msg)
				_ = logRepo.LogEvent("login", "", "", ip, "failure", msg)

				reponse := map[string]interface{}{
					"message": msg,
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(reponse)

				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				msg := "Formato de cabecera incorrecto"

				utils.Logger.WithFields(logrus.Fields{
					"event": "login",
					"ip":    ip,
				}).Error(msg)
				_ = logRepo.LogEvent("login", "", "", ip, "failure", msg)

				reponse := map[string]interface{}{
					"message": msg,
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(reponse)

				return
			}

			tokenString := parts[1]
			claims := &CustomClaims{}
			token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (interface{}, error) {
				// Verificar método de firma
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return []byte(cfg.JWTSecret), nil
			})
			if err != nil {

				utils.Logger.WithFields(logrus.Fields{
					"event": "login",
					"ip":    ip,
				}).Error(err.Error())
				_ = logRepo.LogEvent("login", "", "", ip, "failure", err.Error())

				reponse := map[string]interface{}{
          "message": err.Error(),
        }
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(reponse)

				return
			}
			if !token.Valid {
				msg := "Token inválido o expirado"

				utils.Logger.WithFields(logrus.Fields{
					"event": "login",
					"ip":    ip,
				}).Error(msg)
				_ = logRepo.LogEvent("login", "", "", ip, "failure", msg)
				
				reponse := map[string]interface{}{
					"message": msg,
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(reponse)

				return
			}

			// Extraer el "user" del token
			if claims.User == "" {
				msg := "El owner ID no se encontró en el token"
				
				utils.Logger.WithFields(logrus.Fields{
					"event": "login",
					"ip":    ip,
				}).Error(msg)
				_ = logRepo.LogEvent("login", "", "", ip, "failure", msg)
				
				reponse := map[string]interface{}{
					"message": msg,
				}
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				json.NewEncoder(w).Encode(reponse)

				return
			}

			// Inyectar el user en el contexto
			ctx := context.WithValue(r.Context(), "user", claims.User)
			r = r.WithContext(ctx)

			utils.Logger.WithFields(logrus.Fields{
				"event": "login",
				"ip":    ip,
				"user":  claims.User,
			}).Info("Valid token")
			_ = logRepo.LogEvent("login", "", "", ip, "success", "Valid token")
			next.ServeHTTP(w, r)
		})
	}
}