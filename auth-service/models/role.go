// models/role.go
package models

import (
	"gorm.io/gorm"
)

// Role independiente
type Role struct {
	gorm.Model
	Name string `gorm:"uniqueIndex;not null"`
}

// Asociación N:M User ↔ Role
type UserRole struct {
	gorm.Model
	UserID uint `gorm:"index"`
	RoleID uint `gorm:"index"`
}
