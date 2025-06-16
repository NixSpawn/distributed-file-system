package utils

import (
	"os"

	"github.com/sirupsen/logrus"
)

var Logger = logrus.New()

func init() {
	// Configurar el formato de salida a texto con timestamp completo
	Logger.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	// Establecer el nivel de log; DebugLevel proporciona más detalle
	Logger.SetLevel(logrus.DebugLevel)

	// Configurar la salida a un archivo (opcional)
	file, err := os.OpenFile("logs/app.log", os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err == nil {
		Logger.SetOutput(file)
	} else {
		Logger.Info("No se pudo abrir app.log, se usará la salida estándar")
	}
}

// LogEvent escribe un evento en el log utilizando Logrus con campos estructurados.
func LogEvent(eventType, project, fileURL, ip, status, message string) {
	Logger.WithFields(logrus.Fields{
		"event":   eventType,
		"project": project,
		"ip":      ip,
		"status":  status,
		"url":     fileURL,
	}).Info(message)
}
