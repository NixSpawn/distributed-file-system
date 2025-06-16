package utils

import (
	"auth-service/config"
	"auth-service/models"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func GenerateToken(userID uint, role string) (string, error) {
  claims := jwt.MapClaims{
    "user_id": userID,
    "role":    role,
    "exp":     time.Now().Add(24 * time.Hour).Unix(),
  }
  token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
  return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

// Genera access + refresh tokens
func GenerateTokens(userID uint, roles []string) (access, refresh string, err error) {
  // 1) SessionID
  sid := uuid.NewString()

  // 2) Access token
  atClaims := jwt.MapClaims{
    "user_id":    userID,
    "roles":      roles,
    "session_id": sid,
    "exp":        time.Now().Add(15 * time.Minute).Unix(),
  }
  at := jwt.NewWithClaims(jwt.SigningMethodHS256, atClaims)
  access, err = at.SignedString([]byte(os.Getenv("JWT_SECRET")))
  if err != nil {
    return
  }

  // 3) Refresh token
  rtClaims := jwt.MapClaims{
    "user_id":    userID,
    "session_id": sid,
    "exp":        time.Now().Add(7 * 24 * time.Hour).Unix(),
  }
  rt := jwt.NewWithClaims(jwt.SigningMethodHS256, rtClaims)
  refresh, err = rt.SignedString([]byte(os.Getenv("JWT_REFRESH_SECRET")))
  if err != nil {
    return
  }

  // 4) Guarda en BDD
  tok := models.RefreshToken{
    UserID:    userID,
    Token:     refresh,
    SessionID: sid,
    ExpiresAt: time.Now().Add(7 * 24 * time.Hour),
  }
  if err = config.DB.Create(&tok).Error; err != nil {
		log.Printf("❌ failed to save refresh token: %v", err)
		return
	}
	log.Printf("✅ saved refresh token in DB (session_id=%s)", sid)
  return
}

// Valida un refresh token contra la firma y la BDD
func ValidateRefreshToken(signedToken string) (*jwt.Token, error) {
	// Verifica firma
	token, err := jwt.Parse(signedToken, func(t *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_REFRESH_SECRET")), nil
	})
	if err != nil || !token.Valid {
		return nil, err
	}
	// Comprueba existencia y no expirado en BDD
	var rt models.RefreshToken
	if err := config.DB.Where("token = ?", signedToken).First(&rt).Error; err != nil {
		return nil, err
	}
	if time.Now().After(rt.ExpiresAt) {
		return nil, fmt.Errorf("refresh token expired")
	}
	return token, nil
}