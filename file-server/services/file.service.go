package services

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/models"
	"github.com/t-saturn/file-server/services/storage"
)

// FileService orquesta la lógica relacionada a archivos.
type FileService struct {
	Storage      storage.Storage
	LogRepo      *database.LogRepository
	ReplicaSvc   *ReplicaService
	StoragePath  string
}

// NewFileService crea una instancia de FileService.
func NewFileService(storage storage.Storage, logRepo *database.LogRepository, replicaSvc *ReplicaService, storagePath string) *FileService {
	return &FileService{
		Storage:     storage,
		LogRepo:     logRepo,
		ReplicaSvc:  replicaSvc,
		StoragePath: storagePath,
	}
}

// UploadFile sube un archivo y devuelve la ruta relativa.
func (fs *FileService) UploadFile(project, filename string, data io.Reader) (string, error) {
	// Leer los datos en un búfer para que se puedan leer dos veces
	buf, err := io.ReadAll(data)
	if err != nil {
		return "", err
	}

	// Crear dos lectores a partir del búfer
	reader1 := bytes.NewReader(buf)
	reader2 := bytes.NewReader(buf)

	// Guardar el archivo localmente
	url, err := fs.Storage.SaveFile(project, filename, reader1)
	if err != nil {
		return "", err
	}

	// Replicar el archivo
	if err := fs.ReplicaSvc.ReplicateFile(project, filename, reader2); err != nil {
		// En un sistema real, es posible que desee manejar este error de manera diferente,
		// por ejemplo, agregando el archivo a una cola para reintentar la replicación más tarde.
		// Por ahora, simplemente registraremos el error pero no devolveremos un error al cliente.
		fmt.Printf("Error al replicar el archivo: %v\n", err)
	}

	return url, nil
}

// CreateFileRecord crea el registro del archivo en la base de datos.
func (fs *FileService) CreateFileRecord(originalName, url, ownerID string, isPublic bool) (*models.File, error) {
	return database.InsertFileRecord(fs.LogRepo.DB, originalName, url, ownerID, isPublic)
}

// GetFileRecordByID obtiene un archivo por su ID.
func (fs *FileService) GetFileRecordByID(id string) (*models.File, error) {
	return database.GetFileRecordById(fs.LogRepo.DB, id)
}

// CheckPermission verifica si un usuario tiene permiso para acceder a un archivo.
func (fs *FileService) CheckPermission(file *models.File, userID string) (bool, error) {
	if file.IsPublic {
		return true, nil
	}
	if file.OwnerID == userID {
		return true, nil
	}
	hasPermission, _, err := database.CheckUserFilePermission(fs.LogRepo.DB, file.ID, userID)
	return hasPermission, err
}

// UpdateFilePermissions actualiza los permisos y estado público del archivo.
func (fs *FileService) UpdateFilePermissions(fileID, requestorID string, update *models.UpdateFilePermissionRequest) error {
	file, err := fs.GetFileRecordByID(fileID)
	if err != nil {
		return err
	}
	if file.OwnerID != requestorID {
		return errors.New("solo el propietario puede actualizar los permisos")
	}
	if update.IsPublic != file.IsPublic {
		if err := database.UpdateFileIsPublic(fs.LogRepo.DB, fileID, update.IsPublic); err != nil {
			return err
		}
	}
	if len(update.UserIDs) > 0 && update.Role != "" {
		for _, userID := range update.UserIDs {
			if _, err := database.InsertFilePermissionRecord(fs.LogRepo.DB, fileID, userID, update.Role); err != nil {
				return err
			}
		}
	}
	return nil
}

// RemoveFilePermission elimina el permiso de un archivo.
func (fs *FileService) RemoveFilePermission(fileID, requestorID, userID string) error {
	file, err := fs.GetFileRecordByID(fileID)
	if err != nil {
		return err
	}
	if file.OwnerID != requestorID {
		return errors.New("solo el propietario puede eliminar el permiso de archivo")
	}
	return database.DeleteFilePermission(fs.LogRepo.DB, fileID, userID)
}

// RemoveFile elimina un archivo del sistema (borrado lógico y eliminación física).
func (fs *FileService) RemoveFile(fileID, requestorID string) error {
	file, err := fs.GetFileRecordByID(fileID)
	if err != nil {
		return err
	}
	if file.OwnerID != requestorID {
		return errors.New("solo el propietario puede eliminar el archivo")
	}
	physicalPath := filepath.Join(fs.StoragePath, file.URL)
	if err := os.Remove(physicalPath); err != nil {
		// Se continúa aun si falla la eliminación física
	}

	// Eliminar el archivo del servidor de réplica
	if err := fs.ReplicaSvc.DeleteFile(file.URL); err != nil {
		// Al igual que con la replicación, es posible que desee manejar este error de manera diferente
		// en un sistema real.
		fmt.Printf("Error al eliminar el archivo de la réplica: %v\n", err)
	}

	return database.DeleteFileRecord(fs.LogRepo.DB, fileID)
}
