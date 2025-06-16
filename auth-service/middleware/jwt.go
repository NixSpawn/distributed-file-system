package middleware

import (
	"auth-service/config"
	"auth-service/models"
	"os"
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// JWTMiddleware valida el token y almacena los claims en c.Locals("user")
func JWTMiddleware() fiber.Handler {
  secret := []byte(os.Getenv("JWT_SECRET"))
  return func(c fiber.Ctx) error {
    auth := c.Get("Authorization")
    parts := strings.SplitN(auth, " ", 2)
    if len(parts) != 2 || parts[0] != "Bearer" {
      return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid Authorization header"})
    }

    tokenStr := parts[1]
    token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
      if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
        return nil, jwt.ErrTokenUnverifiable
      }
      return secret, nil
    })
    if err != nil || !token.Valid {
      return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid or expired token"})
    }

    claims := token.Claims.(jwt.MapClaims)
    sid, ok := claims["session_id"].(string)
    if !ok {
      return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "no session_id in token"})
    }

    // Comprueba en BDD que la sesión siga activa
    var rt models.RefreshToken
    if err := config.DB.Where("session_id = ?", sid).First(&rt).Error; err != nil {
      return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "session invalidated"})
    }

    c.Locals("user", token)
    return c.Next()
  }
}
