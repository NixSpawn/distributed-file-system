package storage

import (
	"io"
	"os"
	"path/filepath"
	"time"
)

// LocalStorage implementa la interfaz Storage, guardando archivos en el disco local.
type LocalStorage struct {
	BasePath string
}

func NewLocalStorage(basePath string) *LocalStorage {
	// Crear el directorio base si no existe
	os.MkdirAll(basePath, os.ModePerm)
	return &LocalStorage{
		BasePath: basePath,
	}
}

func (ls *LocalStorage) SaveFile(project, filename string, data io.Reader) (string, error) {
	// Crear una carpeta basada en la fecha (ej: "2025/02/19")
	dateFolder := time.Now().Format("2006/01/02")

	// Estructura final: data/<project>/<YYYY>/<MM>/<DD>
	dirPath := filepath.Join(ls.BasePath, project, dateFolder)
	err := os.MkdirAll(dirPath, os.ModePerm)
	if err != nil {
		return "", err
	}

	// Ruta completa donde se guardará el archivo
	filePath := filepath.Join(dirPath, filename)

	// Crear el archivo en disco
	out, err := os.Create(filePath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	// Copiar los datos al archivo
	_, err = io.Copy(out, data)
	if err != nil {
		return "", err
	}

	// Retornar la ruta relativa (p.ej. "proyecto1/2025/02/19/archivo.pdf")
	relativePath, err := filepath.Rel(ls.BasePath, filePath)
	if err != nil {
		// Si ocurre un error al obtener la ruta relativa, retornamos la ruta absoluta
		return filePath, nil
	}

	return relativePath, nil
}
