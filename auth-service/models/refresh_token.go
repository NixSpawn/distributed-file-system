// models/refresh_token.go
package models

import (
  "time"
  "gorm.io/gorm"
)

type RefreshToken struct {
  gorm.Model
  UserID     uint      `gorm:"index"`
  Token      string    `gorm:"uniqueIndex;not null"`
  SessionID  string    `gorm:"index;not null"`
  ExpiresAt  time.Time `gorm:"not null"`
}
