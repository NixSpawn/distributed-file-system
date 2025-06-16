package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/models"
	"github.com/t-saturn/file-server/utils"
)

// AddFilePermissionHandler agrega un nuevo permiso al archivo
func (fc *FileController) AddFilePermissionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	// Extraer el ownerID (propietario) del token
	ownerID, ok := r.Context().Value("user").(string)
	if !ok || ownerID == "" {

		response := map[string]interface{}{
			"message": "No autorizado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Decodificar el cuerpo JSON.
	// Se espera un JSON con la estructura: { "user_id": "<id>", "role": "viewer" }
	var req struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {

		msg := "Error decodificando JSON: "

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}
	if req.UserID == "" || req.Role == "" {

		msg := "user_id y role son requeridos"

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Verificar que el rol sea válido

	if req.Role != "viewer" && req.Role != "editor" {

		msg := "Rol inválido"

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Verificar que el usuario a agregar no sea el propietario del archivo

	// Obtener el registro del archivo
	fileRecord, err := database.GetFileRecordById(fc.LogRepo.DB, fileID)
	if err != nil || fileRecord == nil {

		msg := "Archivo no encontrado"

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Solo el propietario puede agregar permisos
	if fileRecord.OwnerID != ownerID {

		msg := "No tienes permisos para agregar permisos"

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Insertar el registro de permiso usando el repositorio
	_, err = database.InsertFilePermissionRecord(fc.LogRepo.DB, fileID, req.UserID, req.Role)
	if err != nil {

		msg := "Error agregando permiso: " + err.Error()
		utils.Logger.WithFields(logrus.Fields{
      "event":   "add_permission",
      "file_id": fileID,
      "ip":      ip,
    }).Error(msg)
		_ = fc.LogRepo.LogEvent(
      "add_permission",
      "",
      "file id: " + fileID,
      ip,
			"failure",
      msg,
    )

		response := map[string]interface{}{
			"message": "Error agregando permiso",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Obtener los permisos actualizados del archivo
	permissions, err := database.GetFilePermissions(fc.LogRepo.DB, fileID)
	if err != nil {

		msg := "Error obteniendo permisos"

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)

		return
	}

	// (Opcional) Registrar la operación
	utils.Logger.WithFields(logrus.Fields{
		"event":          "add_permission",
		"file_id":        fileID,
		"owner_id":       ownerID,
		"target_user_id": req.UserID,
		"role":           req.Role,
		"ip":             ip,
	}).Info("Permiso agregado correctamente")

	_ = fc.LogRepo.LogEvent(
		"add_permission",
    "",
    "file id: " + fileID,
    ip,
    "success",
    "Permiso agregado correctamente",
	)

	response := map[string]interface{}{
		"file_id":     fileID,
		"permissions": permissions,
		"message":     "Permiso agregado correctamente",
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// UpdateFilePermissionsHandler actualiza los permisos de un archivo
func (fc *FileController) UpdateFilePermissionsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	// Obtener userID del token
	ownerID, ok := r.Context().Value("user").(string)
	if !ok || ownerID == "" {

		response := map[string]interface{}{
			"message": "No autorizado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Decodificar el cuerpo JSON
	// Se espera un JSON con la estructura: { "user_id": "<id>", "role": "viewer" }
	var req struct {
		UserID string `json:"user_id"`
		Role   string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {

		response := map[string]interface{}{
			"message": "Error decodificando JSON: " + err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Limitar tamaño del cuerpo a 1MB
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	if req.UserID == "" || req.Role == "" {

		response := map[string]interface{}{
			"message": "user_id y role son requeridos",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Verificar que el rol sea válido

	if req.Role != "viewer" && req.Role != "editor" {
		response := map[string]interface{}{
			"message": "Rol inválido",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Verificar que el usuario a agregar no sea el propietario del archivo

	// Obtener el registro del archivo
	fileRecord, err := database.GetFileRecordById(fc.LogRepo.DB, fileID)
	if err != nil || fileRecord == nil {

		response := map[string]interface{}{
			"message": "Archivo no encontrado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Solo el propietario puede agregar permisos
	if fileRecord.OwnerID != ownerID {

		response := map[string]interface{}{
			"message": "No tienes permisos para agregar permisos",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(response)

		return
	}

	updateRequest := &models.UpdateFilePermissionRequest{
		IsPublic: fileRecord.IsPublic,
		UserIDs:  []string{req.UserID},
		Role:     req.Role,
	}

	// Actualizar permisos
	error := fc.FileService.UpdateFilePermissions(fileID, ownerID, updateRequest)
	if error != nil {
		msg := "Error actualizando permisos: "
		utils.Logger.WithError(err).WithFields(logrus.Fields{
			"event":   "update_permissions",
			"file_id": fileID,
			"user_id": ownerID,
			"ip":      ip,
		}).Error(msg)

		_ = fc.LogRepo.LogEvent(
      "update_permissions",
      "",
      "file id: " + fileID,
      ip,
			"failure",
      msg,
    )

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)

		return
	}

	utils.Logger.WithFields(logrus.Fields{
		"event":   "update_permissions",
		"file_id": fileID,
		"user_id": ownerID,
		"ip":      ip,
	}).Info("Permisos actualizados correctamente")

	_ = fc.LogRepo.LogEvent(
    "update_permissions",
    "",
    "file id: " + fileID,
    ip,
		"success",
    "Permisos actualizados correctamente",
  )

	// Obtener los permisos actualizados para la respuesta
	file, _ := fc.FileService.GetFileRecordByID(fileID)
	permissions, _ := database.GetFilePermissions(fc.LogRepo.DB, fileID)

	response := map[string]interface{}{
		"file":        file,
		"permissions": permissions,
		"message":     "Permisos actualizados correctamente",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// DeleteFilePermissionHandler elimina permisos de un archivo
func (fc *FileController) DeleteFilePermissionHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	// Obtener userID del token
	ownerID, ok := r.Context().Value("user").(string)
	if !ok || ownerID == "" {

		response := map[string]interface{}{
			"message": "No autorizado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Decodificar el cuerpo JSON
	// Se espera un JSON con la estructura: { "user_id": "<id>" }
	var req struct {
		UserID string `json:"user_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {

		response := map[string]interface{}{
			"message": "Error decodificando JSON: " + err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Limitar tamaño del cuerpo a 1MB
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)

	if req.UserID == "" {

		response := map[string]interface{}{
			"message": "user_id es requerido",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Obtener el registro del archivo
	fileRecord, err := database.GetFileRecordById(fc.LogRepo.DB, fileID)
	if err != nil || fileRecord == nil {

		response := map[string]interface{}{
			"message": "Archivo no encontrado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Solo el propietario puede eliminar permisos
	if fileRecord.OwnerID != ownerID {

		response := map[string]interface{}{
			"message": "No tienes permisos para eliminar permisos",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Verificar que el usuario a quitar no sea el propietario del archivo
	if req.UserID == ownerID {
		response := map[string]interface{}{
			"message": "Esta acción no está permitida",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Eliminar el registro de permiso usando el repositorio
	err = fc.FileService.RemoveFilePermission(fileID, ownerID, req.UserID)
	if err != nil {
		msg := "Error eliminando permisos: "
		utils.Logger.WithError(err).WithFields(logrus.Fields{
			"event":   "delete_permissions",
			"file_id": fileID,
			"user_id": ownerID,
			"ip":      ip,
		}).Error(msg)

		_ = fc.LogRepo.LogEvent(
      "delete_permissions",
      "",
      "file id: " + fileID,
      ip,
			"failure",
      msg,
    )

		response := map[string]interface{}{
			"message": msg,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	utils.Logger.WithFields(logrus.Fields{
		"event":   "delete_permissions",
		"file_id": fileID,
		"user_id": ownerID,
		"ip":      ip,
	}).Info("Permisos eliminados correctamente")

	_ = fc.LogRepo.LogEvent(
    "delete_permissions",
    "",
    "file id: " + fileID,
    ip,
		"success",
    "Permisos eliminados correctamente",
  )

	// Obtener los permisos actualizados para la respuesta
	file, _ := fc.FileService.GetFileRecordByID(fileID)
	permissions, _ := database.GetFilePermissions(fc.LogRepo.DB, fileID)

	response := map[string]interface{}{
		"file":        file,
		"permissions": permissions,
		"message":     "Permisos eliminados correctamente",
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

}
