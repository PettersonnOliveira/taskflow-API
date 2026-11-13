#!/bin/bash

# Deploy Script for TaskFlow API to Existing VM (144.22.158.86)
# This script deploys to the VM that already has nexus-store and MySQL

set -e

# Configuration
VM_USER="ubuntu"
VM_IP="144.22.158.86"
APP_DIR="~/taskflow-api"
NEXUS_DIR="~/nexus-store"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=== TaskFlow API - Deploy to Existing VM ===${NC}"
echo "VM: ${VM_USER}@${VM_IP}"
echo ""

# Step 1: Create database in existing MySQL
echo -e "${YELLOW}Step 1: Creating database in existing MySQL...${NC}"
read -p "Have you created the taskflow_db database? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Run this command on the VM:${NC}"
    echo "cd ${NEXUS_DIR} && docker compose exec nexus-mysql sh -c 'mysql -u\"\$MYSQL_USER\" -p\"\$MYSQL_PASSWORD\" -e \"CREATE DATABASE IF NOT EXISTS taskflow_db;\"'"
    read -p "Press Enter after creating the database..."
fi

# Step 2: Create directory on VM
echo -e "${YELLOW}Step 2: Creating application directory on VM...${NC}"
ssh ${VM_USER}@${VM_IP} "mkdir -p ${APP_DIR}"

# Step 3: Upload docker-compose file
echo -e "${YELLOW}Step 3: Uploading docker-compose.yml...${NC}"
scp docker-compose.shared-mysql.yml ${VM_USER}@${VM_IP}:${APP_DIR}/docker-compose.yml

# Step 4: Create .env file
echo -e "${YELLOW}Step 4: Creating .env file...${NC}"
echo "You need to provide the MySQL credentials from nexus-store .env file"
read -p "MySQL Username (from nexus-store .env): " DB_USER
read -sp "MySQL Password (from nexus-store .env): " DB_PASSWORD
echo
read -p "JWT Secret (min 32 chars): " JWT_SECRET

cat > /tmp/env.txt <<EOF
SPRING_PROFILES_ACTIVE=prod
DB_NAME=taskflow_db
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=86400000
EOF

scp /tmp/env.txt ${VM_USER}@${VM_IP}:${APP_DIR}/.env
rm /tmp/env.txt

# Step 5: Check Docker network
echo -e "${YELLOW}Step 5: Checking Docker network...${NC}"
echo "The docker-compose uses external network: nexus-store_default"
ssh ${VM_USER}@${VM_IP} "docker network ls | grep nexus-store_default" || {
    echo -e "${RED}Network nexus-store_default not found!${NC}"
    echo "Check the network name with: docker network ls"
    echo "Update docker-compose.yml if needed"
    exit 1
}

# Step 6: Deploy
echo -e "${YELLOW}Step 6: Deploying application...${NC}"
ssh ${VM_USER}@${VM_IP} "cd ${APP_DIR} && docker compose pull"
ssh ${VM_USER}@${VM_IP} "cd ${APP_DIR} && docker compose up -d"

# Step 7: Check status
echo -e "${YELLOW}Step 7: Checking deployment status...${NC}"
ssh ${VM_USER}@${VM_IP} "docker ps | grep taskflow-api"

# Step 8: View logs
echo -e "${YELLOW}Step 8: Viewing logs (Ctrl+C to exit)...${NC}"
ssh ${VM_USER}@${VM_IP} "cd ${APP_DIR} && docker compose logs -f taskflow-api"

echo -e "${GREEN}=== Deployment completed! ===${NC}"
echo ""
echo "Application is running on port 8081"
echo "Access: http://${VM_IP}:8081"
echo ""
echo "To view logs later:"
echo "ssh ${VM_USER}@${VM_IP} 'cd ${APP_DIR} && docker compose logs -f taskflow-api'"
