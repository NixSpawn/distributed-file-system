package controllers

import (
	"encoding/json"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"path/filepath"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/utils"
)

// GetFileHandler devuelve el registro del archivo
func (fc *FileController) GetFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	// Obtener el registro del archivo usando el repositorio
	fileRecord, err := database.GetFileRecordById(fc.FileService.LogRepo.DB, fileID)
	if err != nil || fileRecord == nil {
		response := map[string]interface{}{
			"message": "Archivo no encontrado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Si el archivo es privado, se verifica que el usuario autenticado sea el propietario
	userID, _ := r.Context().Value("user").(string)
	if !fileRecord.IsPublic && fileRecord.OwnerID != userID {
		response := map[string]interface{}{
			"message": "No tienes permisos para acceder al archivo",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Obtener los permisos asociados al archivo
	permissions, err := database.GetFilePermissions(fc.FileService.LogRepo.DB, fileID)
	if err != nil {
		response := map[string]interface{}{
			"message": "Error obteniendo permisos",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// (Opcional) Registrar el acceso
	utils.Logger.WithFields(logrus.Fields{
		"event":   "get_file",
		"file_id": fileID,
		"ip":      ip,
	}).Info("Información del archivo recuperada")

	_ = fc.FileService.LogRepo.LogEvent(
		"get_file",
		"",
		"file_id: "+fileID,
		ip,
		"success",
		"Información del archivo recuperada",
	)

	// Responder con la información del archivo y sus permisos
	response := map[string]interface{}{
		"file":        fileRecord,
		"permissions": permissions,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// ServeFileHandler sirve un archivo por su ID, validando permisos
// ServeFileHandler sirve un archivo por su ID, validando permisos
func (fc *FileController) ServeFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr
	
	// Parámetro opcional para forzar la descarga
	forceDownload := r.URL.Query().Get("download") == "true"

	// Obtener el registro del archivo
	fileRecord, err := fc.FileService.GetFileRecordByID(fileID)
	if err != nil {
			utils.Logger.WithError(err).Error("Archivo no encontrado")
			response := map[string]interface{}{
					"message": "Archivo no encontrado",
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			json.NewEncoder(w).Encode(response)
			return
	}

	// Construir la ruta física absoluta
	filePath := filepath.Join(fc.FileService.StoragePath, fileRecord.URL)
	
	// Asegurar que tenemos un nombre de archivo válido
	filename := fileRecord.OriginalName
	if filename == "" {
			// Si no hay nombre original, usar el nombre del archivo físico o un nombre por defecto
			filename = filepath.Base(fileRecord.URL)
			if filename == "" || filename == "." {
					filename = "download" + filepath.Ext(fileRecord.URL)
			}
	}
	
	// Determinar el tipo de contenido
	contentType := mime.TypeByExtension(filepath.Ext(filename))
	if contentType == "" {
			contentType = "application/octet-stream"
	}
	w.Header().Set("Content-Type", contentType)

	// Si el archivo es público, podemos servirlo directamente
	if fileRecord.IsPublic {
			// Decidir si mostrar en navegador o forzar descarga (igual que para archivos privados)
			if forceDownload || !isViewableInBrowser(contentType) {
					// Forzar descarga
					encodedFilename := url.QueryEscape(filename)
					w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"; filename*=UTF-8''%s`, filename, encodedFilename))
			} else {
					// Mostrar en navegador
					encodedFilename := url.QueryEscape(filename)
					w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"; filename*=UTF-8''%s`, filename, encodedFilename))
			}
			
			// Registrar acceso exitoso para archivo público
			utils.Logger.WithFields(logrus.Fields{
					"event":   "access",
					"file_id": fileID,
					"ip":      ip,
					"public":  true,
			}).Info("Acceso a archivo público exitoso")

			_ = fc.FileService.LogRepo.LogEvent(
					"access",
					"",
					"file_id: "+fileID,
					ip,
					"success",
					"Acceso a archivo público exitoso",
			)

			http.ServeFile(w, r, filePath)
			return
	}

	// Verificar autenticación
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
			msg := "Archivo privado requiere autenticación"
			utils.Logger.WithFields(logrus.Fields{
					"event":   "access",
					"file_id": fileID,
					"ip":      ip,
			}).Warn(msg)

			_ = fc.FileService.LogRepo.LogEvent(
					"access",
					"",
					"file_id: "+fileID,
					ip,
					"failure",
					msg,
			)

			response := map[string]interface{}{
					"message": msg,
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(response)
			return
	}

	// Obtener userID del contexto (si el middleware de auth lo procesó)
	userID, ok := r.Context().Value("user").(string)
	if !ok || userID == "" {
			msg := "Token inválido"
			utils.Logger.WithFields(logrus.Fields{
					"event":   "access",
					"file_id": fileID,
					"ip":      ip,
			}).Warn(msg)

			_ = fc.FileService.LogRepo.LogEvent(
					"access",
					"",
					"file_id: "+fileID,
					ip,
					"failure",
					msg,
			)

			response := map[string]interface{}{
					"message": msg,
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(response)
			return
	}

	// Verificar permiso
	allowed, err := fc.FileService.CheckPermission(fileRecord, userID)
	if err != nil || !allowed {
			msg := "Acceso denegado"
			utils.Logger.WithFields(logrus.Fields{
					"event":   "access",
					"file_id": fileID,
					"user_id": userID,
					"ip":      ip,
			}).Warn(msg)

			response := map[string]interface{}{
					"message": msg,
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusForbidden)
			json.NewEncoder(w).Encode(response)
			return
	}

	// Decidir si mostrar en navegador o forzar descarga
	if forceDownload || !isViewableInBrowser(contentType) {
			// Forzar descarga
			encodedFilename := url.QueryEscape(filename)
			w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"; filename*=UTF-8''%s`, filename, encodedFilename))
	} else {
			// Mostrar en navegador
			encodedFilename := url.QueryEscape(filename)
			w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"; filename*=UTF-8''%s`, filename, encodedFilename))
	}

	// Registrar acceso exitoso
	utils.Logger.WithFields(logrus.Fields{
			"event":   "access",
			"file_id": fileID,
			"user_id": userID,
			"ip":      ip,
	}).Info("Acceso a archivo exitoso")

	_ = fc.FileService.LogRepo.LogEvent(
			"access",
			"",
			"file_id: "+fileID,
			ip,
			"success",
			"Acceso a archivo exitoso",
	)

	http.ServeFile(w, r, filePath)
}

// isViewableInBrowser determina si un tipo de contenido generalmente puede
// ser visualizado directamente en un navegador
func isViewableInBrowser(contentType string) bool {
	viewableTypes := map[string]bool{
			"application/pdf":                   true,
			"text/plain":                        true,
			"text/html":                         true,
			"text/css":                          true,
			"text/javascript":                   true,
			"application/javascript":            true,
			"application/json":                  true,
			"image/jpeg":                        true,
			"image/png":                         true,
			"image/gif":                         true,
			"image/svg+xml":                     true,
			"image/webp":                        true,
			"audio/mpeg":                        true,
			"audio/ogg":                         true,
			"audio/wav":                         true,
			"video/mp4":                         true,
			"video/ogg":                         true,
			"video/webm":                        true,
			"application/vnd.ms-excel":          true,
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": true,
			"application/msword":                true,
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	}
	
	return viewableTypes[contentType]
}