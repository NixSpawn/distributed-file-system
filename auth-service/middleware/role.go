// middleware/role.go
package middleware

import (
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

func RequireRole(role string) fiber.Handler {
  return func(c fiber.Ctx) error {
    user := c.Locals("user").(*jwt.Token)
    claims := user.Claims.(jwt.MapClaims)
    for _, r := range claims["roles"].([]interface{}) {
      if r.(string) == role {
        return c.Next()
      }
    }
    return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "role not allowed"})
  }
}
