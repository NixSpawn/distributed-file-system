package models

import "gorm.io/gorm"

type User struct {
  gorm.Model
  Email      string `gorm:"uniqueIndex;not null"`
  Password   string `gorm:"not null"`
  Role       string `gorm:"default:'user'"`
}

type Permission struct {
  gorm.Model
  UserID      uint   `gorm:"index"`
  Resource    string `gorm:"not null"`
  AccessLevel string `gorm:"not null"` // e.g. "read", "write"
}
