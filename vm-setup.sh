#!/bin/bash

# Script para configurar o taskflow-api na VM existente
# Execute este script na VM após fazer o build e push no Windows

set -e

echo "=== Configurando TaskFlow API na VM ==="

# Criar diretório
mkdir -p ~/taskflow-api
cd ~/taskflow-api

# Criar .env com as credenciais do nexus-store
cat << 'EOF' > .env
SPRING_PROFILES_ACTIVE=prod
DB_NAME=taskflow_db
DB_USER=nexus_user
DB_PASSWORD=0addf195baa802923837e71fb899c29921fd7a4bc18c2d40
JWT_SECRET=taskflow-api-secret-key-2026-petter-dev-portfolio-min-32-chars
JWT_EXPIRATION=86400000
EOF

# Criar docker-compose.yml
cat << 'EOF' > docker-compose.yml
services:
  taskflow-api:
    image: devpetter/taskflow-api:latest
    container_name: taskflow-api
    restart: always
    ports:
      - "8081:8080"
    environment:
      SPRING_PROFILES_ACTIVE: ${SPRING_PROFILES_ACTIVE}
      SPRING_DATASOURCE_URL: jdbc:mysql://nexus-mysql:3306/${DB_NAME}?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=UTC
      SPRING_DATASOURCE_USERNAME: ${DB_USER}
      SPRING_DATASOURCE_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: ${JWT_EXPIRATION}
    networks:
      - nexus-network

networks:
  nexus-network:
    external: true
    name: nexus-store_default
EOF

echo "Arquivos criados com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. docker network ls | grep nexus-store_default"
echo "2. docker compose pull"
echo "3. docker compose up -d"
echo "4. docker compose logs -f taskflow-api"
