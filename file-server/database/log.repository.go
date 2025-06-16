package database

import (
	"log"
	"time"

	"github.com/t-saturn/file-server/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// LogRepository encapsula la conexión a la base de datos mediante GORM para registrar eventos.
type LogRepository struct {
	DB *gorm.DB
}

// NewLogRepository abre la conexión a la base de datos Postgres usando el DSN.
func NewLogRepository(dsn string) (*LogRepository, error) {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, err
	}
	// Migrar el modelo de EventLog.
	if err = db.AutoMigrate(&models.EventLog{}); err != nil {
		return nil, err
	}
	return &LogRepository{DB: db}, nil
}

// LogEvent inserta un registro de evento en la tabla event_logs.
func (repo *LogRepository) LogEvent(eventType, project, fileURL, ip, status, message string) error {
	event := models.EventLog{
		EventType: eventType,
		Project:   project,
		FileURL:   fileURL,
		IP:        ip,
		Status:    status,
		Message:   message,
		CreatedAt: time.Now(),
	}
	if err := repo.DB.Create(&event).Error; err != nil {
		log.Printf("Error registrando el evento en DB: %v", err)
		return err
	}
	return nil
}
