package handlers

import (
	"auth-service/config"
	"auth-service/models"

	"github.com/gofiber/fiber/v3"
)

// CreateRole crea un nuevo rol en la base de datos
func CreateRole(c fiber.Ctx) error {
	type req struct {
		RoleName string `json:"role"`
	}
	var body req
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).
			JSON(fiber.Map{"error": "invalid payload"})
	}

	// Comprueba si ya existe
	var existing models.Role
	if err := config.DB.
		Where("name = ?", body.RoleName).
		First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).
			JSON(fiber.Map{"error": "role already exists"})
	}

	// Crea el rol
	role := models.Role{Name: body.RoleName}
	if err := config.DB.Create(&role).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "could not create role"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":   role.ID,
		"role": role.Name,
	})
}

// GetAllRoles devuelve la lista de todos los nombres de rol
func GetAllRoles(c fiber.Ctx) error {
	var roles []models.Role
	if err := config.DB.Find(&roles).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).
			JSON(fiber.Map{"error": "could not fetch roles"})
	}

	names := make([]string, len(roles))
	for i, r := range roles {
		names[i] = r.Name
	}
	return c.JSON(names)
}

func GetRoles(c fiber.Ctx) error {
	uid := c.Params("user_id")
	var urs []models.UserRole
	config.DB.Where("user_id = ?", uid).Find(&urs)
	var roles []string
	for _, ur := range urs {
		var r models.Role
		config.DB.First(&r, ur.RoleID)
		roles = append(roles, r.Name)
	}
	return c.JSON(roles)
}

func AssignRole(c fiber.Ctx) error {
	type req struct {
		RoleName string `json:"role"`
	}
	var body req
	if err := c.Bind().Body(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
	}
	// Asegura que exista el rol
	var role models.Role
	if err := config.DB.Where("name = ?", body.RoleName).First(&role).Error; err != nil {
		// si no existe, créalo
		role = models.Role{Name: body.RoleName}
		config.DB.Create(&role)
	}
	// Asocia
	ur := models.UserRole{UserID: parseUint(c.Params("user_id")), RoleID: role.ID}
	if err := config.DB.Create(&ur).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "could not assign role"})
	}
	return c.SendStatus(204)
}

func RemoveRole(c fiber.Ctx) error {
  type req struct{ RoleName string `json:"role"` }
  var body req
  if err := c.Bind().Body(&body); err != nil {
    return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid payload"})
  }

  // 1) Encuentra el rol
  var role models.Role
  if err := config.DB.Where("name = ?", body.RoleName).First(&role).Error; err != nil {
    return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "role not found"})
  }

  // 2) Borra user_roles por user_id + role_id
  if err := config.DB.
    Where("user_id = ? AND role_id = ?", parseUint(c.Params("user_id")), role.ID).
    Delete(&models.UserRole{}).Error; err != nil {
    return c.Status(fiber.StatusInternalServerError).
      JSON(fiber.Map{"error": "could not remove role"})
  }

  return c.SendStatus(fiber.StatusNoContent)
}
