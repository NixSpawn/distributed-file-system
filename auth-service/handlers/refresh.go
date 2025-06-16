package handlers

import (
	"auth-service/config"
	"auth-service/models"
	"auth-service/utils"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

func RefreshToken(c fiber.Ctx) error {
	type req struct {
		RefreshToken string `json:"refresh_token"`
	}
	var body req
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}

	token, err := utils.ValidateRefreshToken(body.RefreshToken)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": "invalid or expired refresh token"})
	}

	claims := token.Claims.(jwt.MapClaims)
	userID := uint(claims["user_id"].(float64))

	// Borra el refresh viejo
	config.DB.Where("token = ?", body.RefreshToken).Delete(&models.RefreshToken{})

	// Carga roles actuales
	var userRoles []models.UserRole
	config.DB.Where("user_id = ?", userID).Find(&userRoles)
	var roles []string
	for _, ur := range userRoles {
		var r models.Role
		config.DB.First(&r, ur.RoleID)
		roles = append(roles, r.Name)
	}

	// Genera nuevos tokens
	at, rt, err := utils.GenerateTokens(userID, roles)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "could not generate tokens"})
	}

	return c.JSON(fiber.Map{"access_token": at, "refresh_token": rt})
}
