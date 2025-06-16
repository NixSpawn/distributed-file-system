package controllers

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"github.com/t-saturn/file-server/database"
	"github.com/t-saturn/file-server/utils"
)

// UpdateFileVisibilityHandler actualiza la visibilidad de un archivo
func (fc *FileController) UpdateFileVisibilityHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	fileID := vars["id"]
	ip := r.RemoteAddr

	// Extraer el userID del token
	userID, ok := r.Context().Value("user").(string)
	if !ok || userID == "" {

		response := map[string]interface{}{
			"message": "No autorizado",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Decodificar el cuerpo JSON con la nueva visibilidad.
	// Se espera un JSON con la estructura: { "is_public": true/false }
	var req struct {
		IsPublic bool `json:"is_public"`
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

	// Solo el propietario puede actualizar la visibilidad
	if fileRecord.OwnerID != userID {

		response := map[string]interface{}{
			"message": "No autorizado para actualizar visibilidad",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusForbidden)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Actualizar la visibilidad usando el repositorio
	if err := database.UpdateFileIsPublic(fc.LogRepo.DB, fileID, req.IsPublic); err != nil {

		response := map[string]interface{}{
			"message": "Error actualizando visibilidad",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)

		return
	}

	// Actualizar el campo localmente para la respuesta
	fileRecord.IsPublic = req.IsPublic

	// (Opcional) Registrar la operación
	utils.Logger.WithFields(logrus.Fields{
		"event":     "update_visibility",
		"file_id":   fileID,
		"user_id":   userID,
		"ip":        ip,
		"is_public": req.IsPublic,
	}).Info("Visibilidad del archivo actualizada correctamente")

	fc.LogRepo.LogEvent(
		"update_visibility",
    "",
    "file_id: " + fileID,
    ip,
    "success",
    "Visibilidad actualizada correctamente",
	)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{"file": fileRecord, "message": "Visibilidad actualizada correctamente"})
}