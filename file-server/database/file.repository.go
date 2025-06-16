package database

import (
	"time"

	"github.com/google/uuid"
	"github.com/t-saturn/file-server/config"
	"github.com/t-saturn/file-server/models"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// Migrate realiza la migración de los modelos File y FilePermission.
func Migrate(db *gorm.DB) error {
	// Habilitar la extensión pgcrypto para usar gen_random_uuid()
	if err := db.Exec("CREATE EXTENSION IF NOT EXISTS pgcrypto;").Error; err != nil {
		return err
	}
	// Realizar las migraciones automáticas
	if err := db.AutoMigrate(&models.File{}, &models.FilePermission{}, &models.EventLog{}); err != nil {
		return err
	}
	// Crear el índice único para file_permissions
	if err := db.Exec(`
		CREATE UNIQUE INDEX IF NOT EXISTS file_permissions_file_id_user_id_idx
		ON file_permissions (file_id, user_id)
`).Error; err != nil {
		return err
	}
	return nil
}

// InsertFileRecord inserta un nuevo registro de archivo.
func InsertFileRecord(db *gorm.DB, originalName, url, ownerID string, isPublic bool) (*models.File, error) {

	// Generar el ID
	id := uuid.NewString()

	// Obtener la variable de entorno y concatenar con el ID
	baseURL := config.LoadConfig().FileBaseURL
	fileURL := baseURL + id

	file := models.File{
		ID:           id,
		OriginalName: originalName,
		URL:          url,
		FileUrl:      fileURL,
		OwnerID:      ownerID,
		IsPublic:     isPublic,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	err := db.Create(&file).Error
	return &file, err
}

// GetFileRecordById obtiene un archivo por su ID (solo los no eliminados).
func GetFileRecordById(db *gorm.DB, id string) (*models.File, error) {
	var file models.File
	err := db.Where("id = ? AND deleted_at IS NULL", id).First(&file).Error
	if err != nil {
		return nil, err
	}
	return &file, nil
}

// UpdateFileIsPublic actualiza el estado público/privado de un archivo.
func UpdateFileIsPublic(db *gorm.DB, fileID string, isPublic bool) error {
	return db.Model(&models.File{}).
		Where("id = ? AND deleted_at IS NULL", fileID).
		Updates(map[string]interface{}{"is_public": isPublic, "updated_at": time.Now()}).
		Error
}

// DeleteFileRecord marca un archivo como eliminado (borrado lógico).
func DeleteFileRecord(db *gorm.DB, id string) error {
	return db.Model(&models.File{}).
		Where("id = ? AND deleted_at IS NULL", id).
		Updates(map[string]interface{}{"deleted_at": time.Now(), "updated_at": time.Now()}).
		Error
}

// InsertFilePermissionRecord añade o actualiza un permiso para un archivo.
func InsertFilePermissionRecord(db *gorm.DB, fileID, userID, role string) (*models.FilePermission, error) {
	fp := models.FilePermission{
		ID:        uuid.NewString(),
		FileID:    fileID,
		UserID:    userID,
		Role:      role,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "file_id"}, {Name: "user_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"role", "updated_at"}),
	}).Create(&fp).Error
	return &fp, err
}

// DeleteFilePermission elimina un permiso específico.
func DeleteFilePermission(db *gorm.DB, fileID, userID string) error {
	return db.Where("file_id = ? AND user_id = ?", fileID, userID).
		Delete(&models.FilePermission{}).Error
}

// GetFilePermissions obtiene todos los permisos asociados a un archivo.
func GetFilePermissions(db *gorm.DB, fileID string) ([]*models.FilePermission, error) {
	var permissions []*models.FilePermission
	err := db.Where("file_id = ?", fileID).Find(&permissions).Error
	return permissions, err
}

// CheckUserFilePermission verifica si un usuario tiene permiso sobre un archivo.
func CheckUserFilePermission(db *gorm.DB, fileID, userID string) (bool, string, error) {
	var fp models.FilePermission
	err := db.Select("role").
		Where("file_id = ? AND user_id = ?", fileID, userID).
		First(&fp).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, "", nil
		}
		return false, "", err
	}
	return true, fp.Role, nil
}
