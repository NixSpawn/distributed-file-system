package handlers

import (
	"auth-service/config"
	"auth-service/models"
	"auth-service/utils"
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// parseUint convierte un string a uint (sin manejar error)
func parseUint(s string) uint {
	v, _ := strconv.ParseUint(s, 10, 32)
	return uint(v)
}

// Register crea un nuevo usuario
func Register(c fiber.Ctx) error {
	type req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	var body req
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "cannot parse JSON"})
	}

	hashed, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	user := models.User{Email: body.Email, Password: string(hashed)}
	if err := config.DB.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "could not create user"})
	}
	return c.Status(fiber.StatusCreated).
		JSON(fiber.Map{"message": "user created"})
}

// Login autentica y devuelve un JWT
func Login(c fiber.Ctx) error {
  type req struct {
    Email    string `json:"email"`
    Password string `json:"password"`
  }
  var body req
  if err := c.Bind().Body(&body); err != nil {
    return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "cannot parse JSON"})
  }

  var user models.User
  if err := config.DB.Where("email = ?", body.Email).First(&user).Error; err != nil {
    return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "user not found"})
  }

  if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
    return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
  }

  // Aquí usamos GenerateTokens para obtener both access y refresh
  roles := []string{user.Role} // ajusta si tienes múltiples roles
  access, refresh, err := utils.GenerateTokens(user.ID, roles)
  if err != nil {
    return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not generate tokens"})
  }

  return c.JSON(fiber.Map{
    "access_token":  access,
    "refresh_token": refresh,
  })
}

func Logout(c fiber.Ctx) error {
  token := c.Locals("user").(*jwt.Token)
  claims := token.Claims.(jwt.MapClaims)
  sid := claims["session_id"].(string)

  // Borra la sesión entera (y con ello el refresh token)
  if err := config.DB.Where("session_id = ?", sid).
    Delete(&models.RefreshToken{}).Error; err != nil {
    return c.Status(fiber.StatusInternalServerError).
      JSON(fiber.Map{"error": "could not logout"})
  }
  return c.SendStatus(fiber.StatusNoContent)
}

// ValidateToken devuelve los claims del JWT
func ValidateToken(c fiber.Ctx) error {
	user := c.Locals("user").(*jwt.Token)
	return c.JSON(user.Claims)
}

// Permissions lista los permisos de un usuario
func Permissions(c fiber.Ctx) error {
	uid := c.Params("user_id")
	var perms []models.Permission
	if err := config.DB.
		Where("user_id = ?", uid).
		Find(&perms).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "could not fetch permissions"})
	}
	return c.JSON(perms)
}

// AddPermission añade un permiso a un usuario
func AddPermission(c fiber.Ctx) error {
	type req struct {
		Resource    string `json:"resource"`
		AccessLevel string `json:"access_level"`
	}
	var body req
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "invalid payload"})
	}

	perm := models.Permission{
		UserID:      parseUint(c.Params("user_id")),
		Resource:    body.Resource,
		AccessLevel: body.AccessLevel,
	}
	if err := config.DB.Create(&perm).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "could not add permission"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}

// DeletePermission elimina un permiso por su ID
func DeletePermission(c fiber.Ctx) error {
	if err := config.DB.
		Delete(&models.Permission{}, c.Params("perm_id")).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "could not delete permission"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
