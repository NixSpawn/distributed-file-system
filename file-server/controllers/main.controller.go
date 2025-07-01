package controllers

import (
	"github.com/t-saturn/file-server/services"
)

type FileController struct {
	FileService *services.FileService
	FileBaseURL string
}

func NewFileController(fs *services.FileService, fileBaseURL string) *FileController {
	return &FileController{
		FileService: fs,
		FileBaseURL: fileBaseURL,
	}
}
