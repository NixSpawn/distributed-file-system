package storage

import "io"

// Storage define la interfaz para operaciones de almacenamiento.
type Storage interface {
	SaveFile(project, filename string, data io.Reader) (string, error)
}