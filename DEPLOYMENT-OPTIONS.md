# TaskFlow API - Deployment Options

Este projeto está configurado para deploy na sua VM existente (144.22.158.86).

## 🚀 Opção Recomendada: VM Existente com MySQL Compartilhado

- **Guia**: [DEPLOY-VM-EXISTING.md](DEPLOY-VM-EXISTING.md)
- **Script Windows**: `build-and-push.ps1`
- **Script Linux**: `deploy-to-vm.sh`
- **Custo**: $0 adicional (reutiliza recursos)
- **VM**: 144.22.158.86
- **Porta**: 8081
- **MySQL**: Compartilhado com nexus-store
- **Benefício**: Economia de ~300-400MB RAM

## 📋 Como Fazer o Deploy

### Passo 1: Build e Push (Windows PowerShell)

```powershell
.\build-and-push.ps1
```

### Passo 2: Criar Database (Na VM)

```bash
ssh ubuntu@144.22.158.86
cd ~/nexus-store
docker compose exec nexus-mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS taskflow_db;"'
```

### Passo 3: Deploy (Automatizado)

```bash
chmod +x deploy-to-vm.sh
./deploy-to-vm.sh
```

Ou manualmente, veja [DEPLOY-VM-EXISTING.md](DEPLOY-VM-EXISTING.md).

## 🔧 Estrutura

- **Porta**: 8081 (8080 ocupada pelo nexus-api)
- **MySQL**: Reutiliza container `nexus-mysql`
- **Network**: Conecta à `nexus-store_default`
- **Database**: Schema `taskflow_db` no MySQL existente

## 📚 Documentação Detalhada

Veja [DEPLOY-VM-EXISTING.md](DEPLOY-VM-EXISTING.md) para guia completo passo a passo.


## 📋 Comparativo

| Opção | Custo | Complexidade | Escalabilidade | Recomendado Para |
|-------|-------|--------------|----------------|------------------|
| Compute Instance | $$ | Baixa | Manual | Pequenos projetos, MVP |
| OKE (Kubernetes) | $$$ | Alta | Automática | Produção, grandes projetos |
| Container Instance | $$ | Média | Manual | Testes, projetos pequenos |

## 🛠️ Arquivos de Configuração

### Docker
- `Dockerfile` - Build da aplicação
- `docker-compose.yml` - Desenvolvimento (com MySQL local)
- `docker-compose.prod.yml` - Produção (MySQL externo)
- `.dockerignore` - Arquivos ignorados no build

### OCI
- `oci-deploy.sh` - Script para OCIR e OKE
- `k8s/` - Manifestos Kubernetes
- `compute-setup.sh` - Setup de Compute Instance
- `deploy-to-compute.sh` - Deploy automatizado para Compute

### Nginx
- `nginx/nginx.conf` - Configuração HTTP
- `nginx/nginx-https.conf` - Configuração HTTPS

## 🚦 Passo a Passo Rápido (Compute Instance)

```bash
# 1. Configure suas variáveis
export COMPUTE_IP="seu.ip.publico"
export REPO_URL="https://github.com/usuario/repo.git"

# 2. Execute o deploy
chmod +x deploy-to-compute.sh
COMPUTE_IP=$COMPUTE_IP REPO_URL=$REPO_URL ./deploy-to-compute.sh

# 3. Acesse
http://SEU_IP_PUBLICO
```

## 📚 Documentação Detalhada

- [DEPLOY-COMPUTE.md](DEPLOY-COMPUTE.md) - Guia completo para Compute Instance
- [DEPLOYMENT.md](DEPLOYMENT.md) - Guia geral de deploy na OCI
- [k8s/README.md](k8s/README.md) - Configurações Kubernetes

## 💡 Dicas

### Escolha Compute Instance se:
- Você está começando
- Quer controle total
- Precisa de custo baixo
- Projeto pequeno/médio

### Escolha OKE se:
- Precisa de alta disponibilidade
- Quer auto-scaling
- Projeto de produção grande
- Tem experiência com Kubernetes

### Escolha Container Instance se:
- Quer algo sem servidor
- Projeto simples
- Não precisa de persistência complexa

## 🔒 Segurança

Antes de fazer o deploy, certifique-se de:
- Usar senhas fortes
- Configurar JWT_SECRET seguro (mínimo 32 caracteres)
- Usar HTTPS em produção
- Configurar firewall corretamente
- Nunca commitar secrets no Git

## 💰 Custos OCI

- Compute Instance: $30-50/mês
- MySQL Database Service: $150-300/mês
- OKE Cluster: $70/mês + nós
- Container Instance: $30-50/mês
- Bandwidth: 10TB/mês grátis

## ❓ Suporte

Para dúvidas:
- OCI Documentation: https://docs.oracle.com/en-us/iaas/
- Guia específico da opção escolhida
- OCI Support (criar ticket no console)
