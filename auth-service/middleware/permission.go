// middleware/permission.go
package middleware

import (
	"auth-service/config"
	"auth-service/models"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

func RequirePermission(resource, access string) fiber.Handler {
	return func(c fiber.Ctx) error {
		userID := uint(c.Locals("user").(*jwt.Token).Claims.(jwt.MapClaims)["user_id"].(float64))
		var perm models.Permission
		if err := config.DB.
			Where("user_id = ? AND resource = ? AND access_level = ?", userID, resource, access).
			First(&perm).Error; err != nil {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "permission denied"})
		}
		return c.Next()
	}
}
