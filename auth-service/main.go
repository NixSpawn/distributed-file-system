// main.go
package main

import (
	"auth-service/config"
	"auth-service/handlers"
	"auth-service/middleware"

	"github.com/gofiber/fiber/v3"
)

func main() {
	// Conectar a la base de datos
	config.Connect()

	app := fiber.New()

	// Rutas públicas
	app.Post("/register", handlers.Register)
	app.Post("/login", handlers.Login)
	app.Post("/refresh-token", handlers.RefreshToken)

	api := app.Group("/api", middleware.JWTMiddleware())

	api.Post("/logout", handlers.Logout)

	// Gestión de definiciones de rol
	api.Get("/roles", handlers.GetAllRoles)
	api.Post("/roles", handlers.CreateRole)

	// Endpoints protegidos
	api.Get("/validate-token", handlers.ValidateToken)

	// Roles
	api.Get("/users/:user_id/roles", handlers.GetRoles)
	api.Post("/users/:user_id/roles", handlers.AssignRole)
	api.Delete("/users/:user_id/roles", handlers.RemoveRole)

	// Permisos
	api.Get("/users/:user_id/permissions", handlers.Permissions)
	api.Post("/users/:user_id/permissions", handlers.AddPermission)
	api.Delete("/users/:user_id/permissions/:perm_id", handlers.DeletePermission)

	// Lógica de negocio de ejemplo
	api.Get("/admin/dashboard",
		middleware.RequireRole("admin"),
		func(c fiber.Ctx) error {
			return c.SendString("Bienvenido al panel de admin")
		},
	)
	api.Get("/reports",
		middleware.RequirePermission("reports", "read"),
		func(c fiber.Ctx) error {
			return c.JSON(fiber.Map{"data": "Aquí van tus reportes"})
		},
	)

	// Arranca el servidor
	app.Listen(":8000")
}
