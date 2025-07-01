package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strings"

	"github.com/t-saturn/file-server/config"
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/routes"
	"github.com/t-saturn/file-server/services"
	"github.com/t-saturn/file-server/services/storage"
)

func main() {
	// Definir banderas para los certificados SSL
	certFile := flag.String("cert", "", "/certs/wildcard.crt")
	keyFile := flag.String("key", "", "/certs/wildcard.key")
	flag.Parse()

	// Cargar configuración
	cfg := config.LoadConfig()

	// Construir el DSN para Postgres usando las variables de entorno definidas en la configuración.
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s dbname=%s password=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBName, cfg.DBPassword, cfg.DBSSLMode,
	)

	// Inicializamos el repositorio de logs (usando GORM y Postgres)
	logRepo, err := database.NewLogRepository(dsn)
	if err != nil {
		panic("No se pudo inicializar la base de datos de logs: " + err.Error())
	}

	// Realizamos la migración de los modelos (archivos, permisos y logs de eventos)
	if err := database.Migrate(logRepo.DB); err != nil {
		panic("Error en la migración de modelos: " + err.Error())
	}

	// Inicializar servicios
	replicaSvc := services.NewReplicaService(cfg.ReplicaURL, cfg.ReplicaAuthToken)
	fileSvc := services.NewFileService(storage.NewLocalStorage(cfg.StoragePath), logRepo, replicaSvc, cfg.StoragePath)

	// Configurar rutas
	router := routes.SetupRoutes(fileSvc)

	addr := ":" + strings.TrimSpace(cfg.Port)
	if *certFile != "" && *keyFile != "" {
		log.Printf("Servidor corriendo en el puerto %s con SSL", cfg.Port)
		if err := http.ListenAndServeTLS(addr, *certFile, *keyFile, router); err != nil {
			log.Fatalf("Error al iniciar el servidor con SSL: %v", err)
		}
	} else {
		log.Printf("Servidor corriendo en el puerto %s sin SSL", cfg.Port)
		if err := http.ListenAndServe(addr, router); err != nil {
			log.Fatalf("Error al iniciar el servidor: %v", err)
		}
	}
}
