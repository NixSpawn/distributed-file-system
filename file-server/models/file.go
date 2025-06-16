package models

import (
	"time"
)

// File define la estructura de un archivo.
type File struct {
	ID           string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	OriginalName string     `json:"original_name" gorm:"not null"`
	URL          string     `json:"url" gorm:"not null"`
	FileUrl      string     `json:"file_url" gorm:"not null"`
	OwnerID      string     `json:"owner_id" gorm:"not null"`
	IsPublic     bool       `json:"is_public" gorm:"default:false"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at,omitempty" gorm:"index"`
}

// FilePermission define los permisos asociados a un archivo.
type FilePermission struct {
	ID        string    `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	FileID    string    `json:"file_id" gorm:"not null;index"`
	UserID    string    `json:"user_id" gorm:"not null;index"`
	Role      string    `json:"role" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// UpdateFilePermissionRequest estructura para actualizar permisos.
type UpdateFilePermissionRequest struct {
	IsPublic bool     `json:"is_public,omitempty"`
	UserIDs  []string `json:"user_ids,omitempty"`
	Role     string   `json:"role,omitempty"`
}

// EventLog registra eventos del sistema.
type EventLog struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	EventType string    `json:"event_type"`
	Project   string    `json:"project"`
	FileURL   string    `json:"file_url"`
	IP        string    `json:"ip"`
	Status    string    `json:"status"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}
