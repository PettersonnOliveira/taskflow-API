# Deploy da TaskFlow API na VM Existente (144.22.158.86)

Guia específico para deploy da TaskFlow API na sua VM que já tem o nexus-store e MySQL rodando.

## 🎯 Estratégia

- **Porta**: 8081 (8080 está ocupada pelo nexus-api)
- **MySQL**: Reutilizar o container `nexus-mysql` existente
- **Banco**: Criar schema `taskflow_db` no MySQL existente
- **Network**: Conectar à rede `nexus-store_default` existente
- **Benefício**: Economia de RAM ao não criar novo MySQL

## 📋 Pré-requisitos

- VM OCI: `144.22.158.86`
- nexus-store já rodando com MySQL
- Docker Hub configurado
- SSH access à VM

## Passo 1: Build e Push da Imagem (No Windows)

Execute no PowerShell na raiz do projeto:

```powershell
# Usar o script automatizado
.\build-and-push.ps1
```

Ou manualmente:

```powershell
# 1. Gerar o pacote .jar
.\mvnw.cmd clean package -DskipTests

# 2. Construir a imagem
docker build -t devpetter/taskflow-api:latest .

# 3. Enviar para o Docker Hub
docker push devpetter/taskflow-api:latest
```

## Passo 2: Criar o Banco de Dados (Na VM)

Conecte-se à VM e crie o database no MySQL existente:

```bash
# SSH na VM
ssh ubuntu@144.22.158.86

# Navegar para o nexus-store
cd ~/nexus-store

# Criar o database taskflow_db
docker compose exec nexus-mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS taskflow_db;"'
```

**Nota**: `$MYSQL_USER` e `$MYSQL_PASSWORD` são as variáveis do arquivo `~/nexus-store/.env`.

Verifique se foi criado:

```bash
docker compose exec nexus-mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SHOW DATABASES;"'
```

## Passo 3: Deploy na VM

### Opção A: Usar Script Automatizado

```bash
# No Windows (Git Bash ou PowerShell)
chmod +x deploy-to-vm.sh
./deploy-to-vm.sh
```

### Opção B: Manual

#### 3.1 Criar diretório e configuração

```bash
# SSH na VM
ssh ubuntu@144.22.158.86

# Criar diretório
mkdir -p ~/taskflow-api
cd ~/taskflow-api
```

#### 3.2 Criar arquivo .env

```bash
cat << 'EOF' > .env
SPRING_PROFILES_ACTIVE=prod
DB_NAME=taskflow_db
DB_USER=seu_usuario_mysql_do_nexus
DB_PASSWORD=sua_senha_mysql_do_nexus
JWT_SECRET=sua_chave_secreta_jwt_taskflow_minimo_32_caracteres
JWT_EXPIRATION=86400000
EOF
```

**Importante**: Use o mesmo `DB_USER` e `DB_PASSWORD` do arquivo `~/nexus-store/.env`.

#### 3.3 Criar docker-compose.yml

```bash
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
```

#### 3.4 Verificar nome da rede Docker

Se tiver problemas com a rede, verifique o nome exato:

```bash
docker network ls
```

O nome geralmente é `nexus-store_default`. Se for diferente, atualize o `docker-compose.yml`.

#### 3.5 Subir a aplicação

```bash
# Pull da imagem
docker compose pull

# Subir container
docker compose up -d

# Ver logs
docker compose logs -f taskflow-api
```

## Passo 4: Liberar Porta 8081 no Firewall

### 4.1 No Ubuntu (iptables)

```bash
# Liberar porta 8081
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8081 -j ACCEPT

# Salvar regras
sudo netfilter-persistent save
```

Verifique se foi adicionado:

```bash
sudo iptables -L INPUT -n --line-numbers
```

### 4.2 Na OCI Security List

1. Acesse o console OCI
2. Navegue para: **Networking > Virtual Cloud Networks**
3. Clique na sua VCN
4. Vá para: **Security Lists > Default Security List**
5. Clique em **Add Ingress Rule**
6. Configure:
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `8081`
7. Clique em **Add**

## Passo 5: Verificar Deploy

### 5.1 Verificar container

```bash
ssh ubuntu@144.22.158.86
docker ps | grep taskflow-api
```

### 5.2 Verificar logs

```bash
docker logs taskflow-api
```

### 5.3 Testar API

```bash
# Testar na VM
curl http://localhost:8081/

# Testar de fora
curl http://144.22.158.86:8081/
```

### 5.4 Acessar frontend

O frontend está integrado na aplicação:
- URL: `http://144.22.158.86:8081`

## 🔧 Gerenciamento

### Ver status

```bash
cd ~/taskflow-api
docker compose ps
```

### Ver logs

```bash
docker compose logs -f taskflow-api
```

### Reiniciar

```bash
docker compose restart
```

### Parar

```bash
docker compose down
```

### Atualizar

```bash
# Pull nova imagem
docker compose pull

# Reiniciar
docker compose up -d
```

## 🗂️ Estrutura de Arquivos na VM

```
~/taskflow-api/
├── docker-compose.yml
└── .env
```

## 🔍 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker logs taskflow-api

# Verificar se rede existe
docker network ls | grep nexus-store_default
```

### Erro de conexão com MySQL

Verifique:
- O database `taskflow_db` foi criado
- As credenciais no `.env` estão corretas
- O container `nexus-mysql` está rodando
- A rede Docker está correta

```bash
# Verificar database
cd ~/nexus-store
docker compose exec nexus-mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SHOW DATABASES;"'

# Verificar rede
docker network inspect nexus-store_default
```

### Porta 8081 bloqueada

```bash
# Verificar iptables
sudo iptables -L INPUT -n --line-numbers

# Verificar se processo está escutando
sudo netstat -tlnp | grep 8081
```

### Erro de rede Docker

Se tiver erro "network not found":

```bash
# Listar redes
docker network ls

# Atualizar docker-compose.yml com nome correto
nano docker-compose.yml
```

## 📊 Monitoramento

### Uso de recursos

```bash
# Docker stats
docker stats

# Ver memória
free -h

# Ver CPU
top
```

### Acompanhar logs em tempo real

```bash
cd ~/taskflow-api
docker compose logs -f taskflow-api
```

## 🎉 Resumo

Após completar os passos:

- **API rodando**: `http://144.22.158.86:8081`
- **Frontend**: Integrado na mesma URL
- **MySQL**: Compartilhado com nexus-store
- **Porta**: 8081
- **Economia de RAM**: ~300-400MB (sem MySQL adicional)

## 📝 Checklist

- [ ] Imagem buildada e push para Docker Hub
- [ ] Database `taskflow_db` criado no MySQL existente
- [ ] Diretório `~/taskflow-api` criado na VM
- [ ] Arquivo `.env` configurado com credenciais corretas
- [ ] Arquivo `docker-compose.yml` criado
- [ ] Rede Docker `nexus-store_default` verificada
- [ ] Container subiu com sucesso
- [ ] Porta 8081 liberada no firewall (iptables)
- [ ] Porta 8081 liberada na OCI Security List
- [ ] API acessível via `http://144.22.158.86:8081`

## 🔗 Links Relacionados

- **nexus-store**: `~/nexus-store`
- **MySQL container**: `nexus-mysql`
- **Docker network**: `nexus-store_default`
- **nexus-api**: Porta 8080
- **taskflow-api**: Porta 8081
