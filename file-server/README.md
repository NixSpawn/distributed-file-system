# Servidor de archivos en Go

Este proyecto es un servidor de archivos desarrollado en Go (versión 1.24) que permite:

- **Subida de archivos vía API:** Cada archivo se guarda en un directorio estructurado por _proyecto_ y por fecha (año/mes/día).
- **Autenticación con JWT:** Los endpoints están protegidos mediante tokens JWT, garantizando que solo clientes autorizados puedan acceder.
- **Registro de eventos:** Se registran eventos de inicio de sesión (intentos de autenticación) y de subida de archivos (éxitos y fallos).Los logs se almacenan en:

  - Una base de datos SQLite (tabla `event_logs`).
  - Un archivo plano (`app.log`), ideal para su integración con SIEMs como Wazuh.
- **Servicio seguro de archivos:** Se sirven los archivos mediante una URL única.

---

## Características

- **Estructura de almacenamiento:** Los archivos se almacenan en `STORAGE_PATH` organizados de la siguiente forma:

  ```plaintext
  STORAGE_PATH/
      proyecto1/
          2025/02/19/archivo.ext
      proyecto2/
          ...
  ```

- **Endpoints:**

  - `POST /api/file/upload/{project}`: Subida de archivos para un proyecto específico.
  - `PUT /api/file/{file_id}`: Actualizar archivo por ID.
  - `PUT /api/file/{file_id}/visibility`: Actualizar visibilidad.
  - `GET /api/file/{file_id}`: Obtener información del archivo.
  - `DELETE /api/file/{file_id}`: Eliminar archivo.
  - `POST /api/file/{file_id}/permissions`: Agregar permisos a nuevos usuarios asignados al archivo.
  - `PUT /api/file/{file_id}/permissions`: Actualizar permisos.
  - `DELETE /api/file/{file_id}/permissions`: Eliminar permisos.
  - `GET /files/{file_id}`: Acceso al archivo.
- **Autenticación:**Mediante JWT. El token debe enviarse en el header `Authorization: Bearer <token>`.

  **_Cabecera del token_**

  ```json
  {
    "alg": "HS256",
    "typ": "JWT"
  }
  ```

  **_Cuerpo del token_**

  ```json
  {
    "user": "uuid_user",
    "iat": 1741178145,
    "exp": 1741217745,
    "iss": "server",
    "aud": "users"
  }
  ```

- **Logging:**
  Cada intento de autenticación y de subida (exitoso o fallido) se registra en la base de datos y en un archivo de log.

---

## Requisitos

- **Go 1.24** o superior.
- **Variables de entorno:**Puedes configurar las siguientes variables mediante un archivo `.env` o exportándolas en el entorno:

| Variable        | Descripción                                                                         | Ejemplo                       |
| --------------- | ----------------------------------------------------------------------------------- | ----------------------------- |
| `PORT`          | Puerto en el que se ejecutará el servidor                                           | `8080`                        |
| `STORAGE_PATH`  | Ruta base para almacenar los archivos                                               | `./data`                      |
| `FILE_BASE_URL` | URL base para servir archivos (usualmente `http://localhost:PORT/files`)            | `http://localhost:8080/files` |
| `JWT_SECRET`    | Clave secreta para la firma y verificación de tokens JWT                            | `default_jwt_secret`          |
| `DB_HOST`       | Dirección del servidor de la base de datos (por ejemplo, localhost)                 | `localhost`                   |
| `DB_PORT`       | Puerto del servidor de la base de datos (por lo general 5432 para PostgreSQL)       | `5432`                        |
| `DB_USER`       | Usuario para la conexión a la base de datos                                         | `postgres`                    |
| `DB_PASSWORD`   | Contraseña del usuario para la base de datos                                        | `mi_contraseña_segura`        |
| `DB_NAME`       | Nombre de la base de datos                                                          | `mi_basededatos`              |
| `DB_SSLMODE`    | Modo de conexión SSL (puede ser `disable`, `require`, `verify-ca`, o `verify-full`) | `require`                     |

- **Dependencias externas:**

Aquí está la sección de **dependencias externas** actualizada según tu configuración actual:

- [Gorilla Mux](https://github.com/gorilla/mux) (`github.com/gorilla/mux v1.8.1`) – Para el manejo de rutas en el servidor.
- [golang-jwt/jwt/v5](https://github.com/golang-jwt/jwt/v5) (`github.com/golang-jwt/jwt/v5 v5.2.1`) – Para la autenticación y manejo de tokens JWT.
- [jackc/pgx/v5](https://github.com/jackc/pgx) (`github.com/jackc/pgx/v5 v5.7.2`) – Driver de PostgreSQL para Go.
- [gorm.io/gorm](https://gorm.io/) (`gorm.io/gorm v1.25.12`) – ORM para manejar la base de datos.
- [gorm.io/driver/postgres](https://gorm.io/docs/driver_postgres.html) (`gorm.io/driver/postgres v1.5.11`) – Driver de PostgreSQL para GORM.
- [joho/godotenv](https://github.com/joho/godotenv) (`github.com/joho/godotenv v1.5.1`) – (Opcional) Para cargar variables de entorno desde un archivo `.env`.
- [sirupsen/logrus](https://github.com/sirupsen/logrus) (`github.com/sirupsen/logrus v1.9.3`) – Para logging estructurado.
- [google/uuid](https://github.com/google/uuid) (`github.com/google/uuid v1.6.0`) – Para la generación de UUIDs únicos.
- [dustin/go-humanize](https://github.com/dustin/go-humanize) (`github.com/dustin/go-humanize v1.0.1`) – Para formatear números en formatos legibles (por ejemplo, tamaños de archivo).
- [golang.org/x/crypto](https://pkg.go.dev/golang.org/x/crypto) (`golang.org/x/crypto v0.35.0`) – Para funciones criptográficas adicionales.

---

## Instalación

1. **Clona el repositorio:**

   ```bash
   git clone https://github.com/t-saturn/file-server.git
   cd file-server
   ```

2. **Crea un archivo `.env` en la raíz del proyecto** con el siguiente contenido:

   ```env
   PORT=8080
   STORAGE_PATH=./data
   FILE_BASE_URL=http://localhost:8080/files
   JWT_SECRET=default_jwt_secret

   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=files
   DB_SSLMODE=disable
   ```

3. **Instala las dependencias:**

   ```bash
   go mod tidy
   ```

4. **Construye y ejecuta la aplicación:**

   ```bash
   go run main.go
   ```

---

## Uso

## 🔐 Autenticación

Para todas las rutas bajo `/api/file/` es obligatorio enviar un **Bearer Token** en el encabezado de la petición:

``` plaintext
Authorization: Bearer <token>
```

El acceso a archivos en `/files/{file_id}` dependerá de si el archivo es público o privado.

### 🔹 1. Subir un Archivo

- **URL:** `/api/file/upload/{project}`
- **Método:** `POST`
- **Descripción:** Sube un archivo a un proyecto específico.
- **Parámetros de ruta:**
  - `project` (string): Identificador del proyecto.
- **Cuerpo de la solicitud (multipart/form-data):**
  - `file`: Archivo a subir.
  - `is_public` (opcional, booleano): `true` para público, si no se envía es privado por defecto.
- **Respuesta esperada (JSON):**

  ```json
  {
    "file": {
      "id": "85a93bf9-9e83-4c02-af06-d2cf29622a66",
      "original_name": "file.pdf",
      "url": "prueba/2025/03/05/b5ed946e-4a33-432f-bae4-9f0861961fbf.pdf",
      "owner_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
      "is_public": false,
      "created_at": "2025-03-05T09:49:42.4358094-05:00",
      "updated_at": "2025-03-05T09:49:42.4358094-05:00"
      },
    "message": "Archivo subido exitosamente"
  }
  ```

### 🔹 2. Actualizar un Archivo

- **URL:** `/api/file/{file_id}`
- **Método:** `PUT`
- **Descripción:** Reemplaza un archivo existente con uno nuevo.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Cuerpo de la solicitud (multipart/form-data):**
  - `file`: Archivo a actualizar.
- **Respuesta esperada (JSON):**

  ```json
  {
    "file": {
      "id": "85a93bf9-9e83-4c02-af06-d2cf29622a66",
      "original_name": "new_file.pdf",
      "url": "prueba/2025/03/05/b5ed946e-4a33-432f-bae4-9f0861961fbf.pdf",
      "owner_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
      "is_public": false,
      "created_at": "2025-03-05T09:49:42.4358094-05:00",
      "updated_at": "2025-03-05T09:49:42.4358094-05:00"
      },
    "message": "Archivo actualizado exitosamente"
  }
  ```

---

### 🔹 3. Actualizar Visibilidad del Archivo

- **URL:** `/api/file/{file_id}/visibility`
- **Método:** `PUT`
- **Descripción:** Cambia la visibilidad de un archivo.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Cuerpo de la solicitud (JSON):**
  
  ```json
  {
    "is_public": true
  }
  ```

- **Respuesta esperada (JSON):**

  ```json
  {
  "file": {
    "id": "85a93bf9-9e83-4c02-af06-d2cf29622a66",
    "original_name": "new_file.pdf",
    "url": "prueba/2025/03/05/2025/03/05/2025/03/05/f3b7bdd0-3541-4f35-9081-0d72b58ea32a.pdf",
    "owner_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
    "is_public": true,
    "created_at": "2025-03-05T09:49:42.435809-05:00",
    "updated_at": "2025-03-05T10:12:08.87685-05:00"
    },
    "message": "Visibilidad actualizada correctamente"
  }
  ```

---

### 🔹 4. Obtener Información de un Archivo

- **URL:** `/api/file/{file_id}`
- **Método:** `GET`
- **Descripción:** Obtiene los detalles de un archivo.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Respuesta esperada (JSON):**

  ```json
  {
    "file": {
      "id": "85a93bf9-9e83-4c02-af06-d2cf29622a66",
      "original_name": "mew_file.pdf",
      "url": "prueba/2025/03/05/2025/03/05/2025/03/05/f3b7bdd0-3541-4f35-9081-0d72b58ea32a.pdf",
      "owner_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
      "is_public": true,
      "created_at": "2025-03-05T09:49:42.435809-05:00",
      "updated_at": "2025-03-05T10:13:40.193802-05:00"
    },
    "permissions": [
      {
        "id": "88cad72c-d9b9-47d1-8de6-6923524ff8a4",
        "file_id": "85a93bf9-9e83-4c02-af06-d2cf29622a66",
        "user_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
        "role": "owner",
        "created_at": "2025-03-05T09:49:42.437378-05:00",
        "updated_at": "2025-03-05T09:49:42.437378-05:00"
      }
    ]
  }
  ```

---

### 🔹 5. Eliminar un Archivo

- **URL:** `/api/file/{file_id}`
- **Método:** `DELETE`
- **Descripción:** Elimina un archivo por su ID.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Respuesta esperada (JSON):**

  ```json
  {
    "id": "85a93bf9-9e83-4c02-af06-d2cf29622a66",
    "message": "Archivo eliminado correctamente"
  }
  ```

---

### 🔹 6. Agregar Permisos a un Archivo

- **URL:** `/api/file/{file_id}/permissions`
- **Método:** `POST`
- **Descripción:** Asigna permisos a un usuario para acceder a un archivo.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Cuerpo de la solicitud (JSON):**
  
  ```json
  {
    "user_id": "df6046c6-5fa8-428f-8f43-8d47946be588",
    "role": "viewer"
  }
  ```

- **Respuesta esperada (JSON):**
  
  ```json
  {
    "file_id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
    "message": "Permiso agregado correctamente",
    "permissions": [
      {
        "id": "9580bd28-20c2-4974-b02d-3f6dc8ff119e",
        "file_id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
        "user_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
        "role": "owner",
        "created_at": "2025-03-05T10:19:40.843561-05:00",
        "updated_at": "2025-03-05T10:19:40.843561-05:00"
      },
      {
        "id": "3a9a88e2-5283-4a6e-9a80-ab10de843d96",
        "file_id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
        "user_id": "df6046c6-5fa8-428f-8f43-8d47946be588",
        "role": "viewer",
        "created_at": "2025-03-05T10:20:23.124157-05:00",
        "updated_at": "2025-03-05T10:20:23.124157-05:00"
      }
    ]
  }
  ```

---

### 🔹 7. Actualizar Permisos de un Archivo

- **URL:** `/api/file/{file_id}/permissions`
- **Método:** `PUT`
- **Descripción:** Modifica los permisos de un usuario en un archivo.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Cuerpo de la solicitud (JSON):**
  
  ```json
  {
    "user_id": "df6046c6-5fa8-428f-8f43-8d47946be588",
    "role": "editor"
  }
  ```

- **Respuesta esperada (JSON):**
  
  ```json
  {
    "file": {
      "id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
      "original_name": "file.pdf",
      "url": "prueba/2025/03/05/e98fb6bf-f113-40ea-80a3-264ea6d8a2f0.pdf",
      "owner_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
      "is_public": false,
      "created_at": "2025-03-05T10:19:40.842526-05:00",
      "updated_at": "2025-03-05T10:19:40.842526-05:00"
    },
    "message": "Permisos actualizados correctamente",
    "permissions": [
      {
        "id": "9580bd28-20c2-4974-b02d-3f6dc8ff119e",
        "file_id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
        "user_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
        "role": "owner",
        "created_at": "2025-03-05T10:19:40.843561-05:00",
        "updated_at": "2025-03-05T10:19:40.843561-05:00"
      },
      {
        "id": "3a9a88e2-5283-4a6e-9a80-ab10de843d96",
        "file_id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
        "user_id": "df6046c6-5fa8-428f-8f43-8d47946be588",
        "role": "editor",
        "created_at": "2025-03-05T10:20:23.124157-05:00",
        "updated_at": "2025-03-05T10:23:01.00781-05:00"
      }
    ]
  }
  ```

---

### 🔹 8. Eliminar Permiso de un Usuario en un Archivo

- **URL:** `/api/file/{file_id}/permissions`
- **Método:** `DELETE`
- **Descripción:** Revoca el permiso de un usuario sobre un archivo.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Cuerpo de la solicitud (JSON):**
  
  ```json
  {
    "user_id": "df6046c6-5fa8-428f-8f43-8d47946be588"
  }
  ```

- **Respuesta esperada (JSON):**
  
  ```json
  {
    "file": {
      "id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
      "original_name": "file.pdf",
      "url": "prueba/2025/03/05/e98fb6bf-f113-40ea-80a3-264ea6d8a2f0.pdf",
      "owner_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
      "is_public": false,
      "created_at": "2025-03-05T10:19:40.842526-05:00",
      "updated_at": "2025-03-05T10:19:40.842526-05:00"
    },
    "message": "Permisos eliminados correctamente",
    "permissions": [
      {
        "id": "9580bd28-20c2-4974-b02d-3f6dc8ff119e",
        "file_id": "c13515ff-f4d3-4877-94d5-32540fe1fae3",
        "user_id": "1d22e9d5-0e1d-4b16-b44b-d44e09301164",
        "role": "owner",
        "created_at": "2025-03-05T10:19:40.843561-05:00",
        "updated_at": "2025-03-05T10:19:40.843561-05:00"
      }
    ]
  }
  ```

---

### 🔹 9. Acceder a un Archivo

- **URL:** `/files/{file_id}`
- **Método:** `GET`
- **Descripción:** Descarga el archivo si es público. Si es privado, requiere autenticación.
- **Parámetros de ruta:**
  - `file_id` (UUID): Identificador único del archivo.
- **Autenticación:**  
  - No requerida si el archivo es público.  
  - Si el archivo es privado, se debe enviar un **Bearer Token**.

---

## 📢 Notas Adicionales

- Un archivo privado solo puede ser descargado por su propietario o usuarios con permisos asignados.
- La API usa **UUIDs** para identificar archivos y usuarios.
- La visibilidad del archivo (`is_public`) determina si es accesible sin autenticación.
