package services

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"time"
)

// ReplicaService maneja la comunicación con el servidor de réplica.
type ReplicaService struct {
	ReplicaURL       string
	ReplicaAuthToken string
	httpClient       *http.Client
}

// NewReplicaService crea una instancia de ReplicaService.
func NewReplicaService(replicaURL string, replicaAuthToken string) *ReplicaService {
	return &ReplicaService{
		ReplicaURL:       replicaURL,
		ReplicaAuthToken: replicaAuthToken,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        10,
				MaxIdleConnsPerHost: 2,
				IdleConnTimeout:     90 * time.Second,
				DisableKeepAlives:   false,
			},
		},
	}
}

// ReplicateFile envía un archivo al servidor de réplica.
func (rs *ReplicaService) ReplicateFile(project, filename string, data io.Reader) error {
	if rs.ReplicaURL == "" {
		return nil // No hay servidor de réplica configurado
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filename)
	if err != nil {
		return err
	}

	if _, err := io.Copy(part, data); err != nil {
		return err
	}
	writer.Close()

	// Corregir la URL - usar parámetro de path en lugar de query
	url := fmt.Sprintf("%s/internal/upload/%s", rs.ReplicaURL, url.PathEscape(project))
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())
	if rs.ReplicaAuthToken != "" {
		req.Header.Set("Authorization", "Bearer "+rs.ReplicaAuthToken)
	}

	// Usar el cliente HTTP compartido
	resp, err := rs.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("la replicación falló con el código de estado: %d, cuerpo de respuesta: %s", resp.StatusCode, string(respBody))
	}

	return nil
}

// DeleteFile envía una solicitud de eliminación de archivo al servidor de réplica.
func (rs *ReplicaService) DeleteFile(fileURL string) error {
	if rs.ReplicaURL == "" {
		return nil // No hay servidor de réplica configurado
	}

	// Escapar la URL del archivo para evitar problemas con caracteres especiales
	url := fmt.Sprintf("%s/internal/delete/%s", rs.ReplicaURL, url.PathEscape(fileURL))
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}
	if rs.ReplicaAuthToken != "" {
		req.Header.Set("Authorization", "Bearer "+rs.ReplicaAuthToken)
	}

	// Usar el cliente HTTP compartido
	resp, err := rs.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("la eliminación de la réplica falló con el código de estado: %d, cuerpo de respuesta: %s", resp.StatusCode, string(respBody))
	}

	return nil
}