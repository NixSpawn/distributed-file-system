package main

import (
	"flag"
	"log"
	"net/http"
	"strings"

	"github.com/t-saturn/file-server/config"
	"github.com/t-saturn/file-server/routes"
)

func main() {
	// Definir banderas para los certificados SSL
	certFile := flag.String("cert", "", "/certs/wildcard.crt")
	keyFile := flag.String("key", "", "/certs/wildcard.key")
	flag.Parse()

	// Cargar configuración
	cfg := config.LoadConfig()

	// Configurar rutas
	router := routes.SetupRoutes()

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
