package controllers

import (
	"encoding/json"
	"net/http"
	"net/url"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/models"
	"github.com/t-saturn/file-server/utils"
)

// UploadFileHandler procesa la subida de archivos y crea el registro en Postgres mediante GORM.
func (fc *FileController) UploadFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	project := vars["project"]
	ip := r.RemoteAddr

	// Extraer owner_id del token
	ownerID, ok := r.Context().Value("user").(string)
	if !ok || ownerID == "" {
		msg := "No autorizado: No existe el owner_id en el token"
		utils.Logger.WithFields(logrus.Fields{"event": "upload", "project": project, "ip": ip}).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return
	}

	if project == "" {
		msg := "No se proporcionó nombre de proyecto"
		utils.Logger.WithFields(logrus.Fields{"event": "upload", "project": project, "ip": ip}).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		msg := "Error al leer el archivo: " + err.Error()
		utils.Logger.WithFields(logrus.Fields{"event": "upload", "project": project, "ip": ip}).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return
	}
	defer file.Close()

	isPublic := r.FormValue("is_public") == "true"
	newFileName := uuid.New().String() + filepath.Ext(header.Filename)
	relativePath, err := fc.FileService.UploadFile(project, newFileName, file)
	if err != nil {
		msg := "Error al guardar el archivo: " + err.Error()
		utils.Logger.WithFields(logrus.Fields{"event": "upload", "project": project, "ip": ip}).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return
	}

	normalizedPath := filepath.ToSlash(relativePath)
	u, err := url.Parse(fc.FileBaseURL)
	if err != nil {

		msg := "Error construyendo URL base: " + err.Error()

		utils.Logger.WithFields(logrus.Fields{"event": "upload", "project": project, "ip": ip}).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return
	}

	u.Path = path.Join(u.Path, normalizedPath)

	// Crear registro del archivo mediante FileService
	fileRecord, err := fc.FileService.CreateFileRecord(header.Filename, normalizedPath, ownerID, isPublic)
	if err != nil {
		msg := "Error insertando metadatos: " + err.Error()
		utils.Logger.WithError(err).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return
	}

	// Asignar permiso de "owner"
	_, err = database.InsertFilePermissionRecord(fc.FileService.LogRepo.DB, fileRecord.ID, ownerID, "owner")
	if err != nil {

		msg := "Error asignando permisos de propietario del archivo"

		utils.Logger.WithError(err).Error(msg)
		_ = fc.FileService.LogRepo.LogEvent("upload", project, "", ip, "failure", msg)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"error": msg})
		return

	}

	utils.Logger.WithFields(logrus.Fields{
		"event": "upload", "project": project, "ip": ip,
		"file_name": header.Filename, "file_id": fileRecord.ID, "is_public": isPublic,
	}).Info("Archivo subido exitosamente")

	_ = fc.FileService.LogRepo.LogEvent(
		"upload",
		project,
		fileRecord.URL,
		ip,
		"success",
		"Archivo subido exitosamente",
	)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"file": fileRecord, "message": "Archivo subido exitosamente"})
}

// UpdateFileHandler actualiza el archivo subido.
func (fc *FileController) UpdateFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	userID, ok := r.Context().Value("user").(string)
	if !ok || userID == "" {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "No autorizado"})
		return
	}

	fileRecord, err := database.GetFileRecordById(fc.FileService.LogRepo.DB, fileID)
	if err != nil || fileRecord == nil {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Archivo no encontrado"})
		return
	}

	allowed, role, err := database.CheckUserFilePermission(fc.FileService.LogRepo.DB, fileID, userID)
	if err != nil {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Error verificando permisos"})
		return
	}
	if !allowed || (role != "owner" && role != "editor") {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "No autorizado para actualizar el archivo"})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Error leyendo archivo"})
		return
	}
	defer file.Close()

	directory := filepath.Dir(fileRecord.URL)
	newFileName := uuid.New().String() + filepath.Ext(header.Filename)
	cleanDir := filepath.Clean(directory)
	if strings.Contains(cleanDir, "..") {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Directorio no válido"})
		return
	}

	project := cleanDir
	if project == "." {
		project = ""
	}
	newPath, err := fc.FileService.UploadFile(project, newFileName, file)
	if err != nil {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Error al subir el nuevo archivo"})
		return
	}
	normalizedPath := filepath.ToSlash(newPath)
	finalPath := filepath.Join(fc.FileService.StoragePath, normalizedPath)
	absStoragePath, _ := filepath.Abs(fc.FileService.StoragePath)
	absFinalPath, _ := filepath.Abs(finalPath)
	if !strings.HasPrefix(absFinalPath, absStoragePath) {

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Ruta de archivo insegura"})
		return
	}

	now := time.Now()
	err = fc.FileService.LogRepo.DB.Model(&models.File{}).
		Where("id = ? AND deleted_at IS NULL", fileID).
		Updates(map[string]interface{}{"original_name": header.Filename, "url": normalizedPath, "updated_at": now}).
		Error
	if err != nil {

		utils.Logger.WithFields(logrus.Fields{
			"event":   "update",
			"file_id": fileID,
			"ip":      ip,
		}).Error("Error actualizando registro")

		_ = fc.FileService.LogRepo.LogEvent(
			"update",
			project,
			"",
			ip,
			"failure",
			"Error actualizando registro",
		)

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]interface{}{"message": "Error actualizando registro"})
		return
	}

	fileRecord.OriginalName = header.Filename
	fileRecord.URL = normalizedPath
	fileRecord.UpdatedAt = now

	utils.Logger.WithFields(logrus.Fields{
		"event": "update_file", "file_id": fileID, "user_id": userID, "ip": ip,
		"role": role, "new_file_name": header.Filename,
	}).Info("Archivo actualizado exitosamente")

	_ = fc.FileService.LogRepo.LogEvent("update", project, fileRecord.URL, ip, "success", "Archivo actualizado exitosamente")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"file": fileRecord, "message": "Archivo actualizado exitosamente"})
}

// DeleteFileHandler elimina un archivo por su ID.
func (fc *FileController) DeleteFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	userID, ok := r.Context().Value("user").(string)
	if !ok || userID == "" {

		msg := "No autorizado"
		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)

		return
	}

	err := fc.FileService.RemoveFile(fileID, userID)
	if err != nil {
		msg := "Error eliminando archivo: " + err.Error()

		utils.Logger.WithError(err).WithFields(logrus.Fields{
			"event":   "delete",
			"file_id": fileID,
			"user_id": userID,
			"ip":      ip,
		}).Error(msg)

		_ = fc.FileService.LogRepo.LogEvent("delete", "", "file id: "+fileID, ip, "failure", msg)

		response := map[string]interface{}{
			"message": "Error eliminando el archivo",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)

		return
	}

	utils.Logger.WithFields(logrus.Fields{
		"event":   "delete",
		"file_id": fileID,
		"user_id": userID,
		"ip":      ip,
	}).Info("Archivo eliminado exitosamente")

	_ = fc.FileService.LogRepo.LogEvent("delete", "", "file id: "+fileID, ip, "success", "Archivo eliminado correctamente")

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":      fileID,
		"message": "Archivo eliminado correctamente",
	})
}

// InternalUploadFileHandler maneja la carga de archivos replicados internamente.
func (fc *FileController) InternalUploadFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	project := vars["project"]

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error al leer el archivo: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	newFileName := uuid.New().String() + filepath.Ext(header.Filename)
	_, err = fc.FileService.UploadFile(project, newFileName, file)
	if err != nil {
		http.Error(w, "Error al guardar el archivo replicado: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Archivo replicado exitosamente"})
}

// InternalDeleteFileHandler maneja la eliminación de archivos replicados internamente.
func (fc *FileController) InternalDeleteFileHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]

	err := fc.FileService.RemoveFile(fileID, "") // No hay requestorID para eliminación interna
	if err != nil {
		http.Error(w, "Error al eliminar el archivo replicado: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "Archivo replicado eliminado exitosamente"})
}
