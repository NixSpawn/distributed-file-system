# Etapa de compilación
FROM golang:1.24 AS builder

WORKDIR /app
COPY . .

# Compilar para Linux (amd64) y ajustar permisos del binario
RUN GOOS=linux GOARCH=amd64 go build -o file_server . && \
    chmod +x file_server && \
    ls -lah file_server

# Etapa final - Contenedor basado en Ubuntu
FROM ubuntu:latest

WORKDIR /app

# Instalar dependencias y gosu (para cambiar de usuario de forma segura)
RUN apt update && apt install -y ca-certificates curl && rm -rf /var/lib/apt/lists/* && \
    apt update && apt install -y --no-install-recommends gosu && \
    rm -rf /var/lib/apt/lists/*

# Crear usuario y grupo no root
RUN groupadd --system appgroup && useradd --system --gid appgroup appuser

# Crear carpetas y asignar permisos iniciales
RUN mkdir -p /app/data /app/logs && \
    chown -R appuser:appgroup /app/data /app/logs && \
    chmod -R 775 /app/data /app/logs

# Copiar el binario compilado desde la etapa builder
COPY --from=builder /app/file_server /app/file_server
RUN chmod +x /app/file_server

# Copiar archivo de configuración
COPY .env /app/.env

# Crear script de entrypoint que corra como root, ajuste permisos y luego cambie a appuser
USER root
RUN echo '#!/bin/bash\n\
set -e\n\
# Intentar ajustar la propiedad; si falla (por ejemplo, por bind mounts) se muestra un mensaje\n\
chown -R appuser:appgroup /app/data /app/logs || echo "Advertencia: no se pudieron cambiar los permisos. Si usas bind mounts, asegúrate de que el directorio host tenga los permisos adecuados."\n\
exec gosu appuser "$@"' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Exponer puertos para acceso externo
EXPOSE 80 443

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["/app/file_server"]
