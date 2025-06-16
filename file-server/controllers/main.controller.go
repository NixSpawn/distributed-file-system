package controllers

import (
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/services"
)

type FileController struct {
	FileService *services.FileService
	FileBaseURL string
	LogRepo     *database.LogRepository
	StoragePath string
}

func NewFileController(fs *services.FileService, fileBaseURL string, logRepo *database.LogRepository, storagePath string) *FileController {
	// Agregar el StoragePath al servicio también
	fs.StoragePath = storagePath

	return &FileController{
		FileService: fs,
		FileBaseURL: fileBaseURL,
		LogRepo:     logRepo,
		StoragePath: storagePath,
	}
}
