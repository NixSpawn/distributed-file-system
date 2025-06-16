package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port        string
	StoragePath string
	FileBaseURL string
	JWTSecret   string
	DBHost      string
	DBPort      string
	DBUser      string
	DBName      string
	DBPassword  string
	DBSSLMode   string
}

func LoadConfig() Config {
	// Cargar variables desde .env (si existe)
	_ = godotenv.Load()

	return Config{
		Port:        os.Getenv("PORT"),
		StoragePath: os.Getenv("STORAGE_PATH"),
		FileBaseURL: os.Getenv("FILE_BASE_URL"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		DBHost:      os.Getenv("DB_HOST"),
		DBPort:      os.Getenv("DB_PORT"),
		DBUser:      os.Getenv("DB_USER"),
		DBName:      os.Getenv("DB_NAME"),
		DBPassword:  os.Getenv("DB_PASSWORD"),
		DBSSLMode:   os.Getenv("DB_SSLMODE"),
	}
}
