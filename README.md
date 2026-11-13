# 🚀 TaskFlow API

API REST para gerenciamento de tarefas, desenvolvida como projeto de portfólio com foco em organização, clareza e boas práticas de backend com Java e Spring Boot.

Com ela é possível criar, listar, consultar, atualizar e remover tarefas, servindo como base para um sistema de produtividade mais completo no futuro.

## ✨ Destaques

- CRUD completo de tarefas
- Estrutura em camadas bem definida
- Uso de DTOs para entrada e saída de dados
- Persistência com MySQL + JPA/Hibernate
- Validação de dados com Bean Validation
- Respostas HTTP apropriadas para cada operação
- Autenticação com Spring Security + JWT
- Frontend funcional e estético integrado
- Docker pronto para deploy na OCI

## 🛠️ Tecnologias

- Java 21
- Spring Boot 4
- Spring Web / Spring MVC
- Spring Data JPA
- Bean Validation
- MySQL
- Spring Security
- JWT (JSON Web Token)
- Maven

## 🏗️ Arquitetura

```text
Controller → Service → Repository → Banco de Dados
```

- **Controller**: expõe os endpoints HTTP
- **Service**: concentra as regras de negócio
- **Repository**: realiza o acesso aos dados
- **DTOs**: controlam o formato de entrada e saída
- **Entity**: representa a tabela `task`

## 📦 Estrutura do projeto

```text
src/main/java/com/portfolio/TaskFlow/API
├── Controllers
├── Dto
├── Entities
├── Repositories
├── Services
├── config
└── security
```

## 📋 Modelo de dados

### `Task`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `Long` | Identificador da tarefa |
| `title` | `String` | Título da tarefa |
| `description` | `String` | Descrição opcional |
| `status` | `Enum` | `PENDING`, `IN_PROGRESS` ou `COMPLETED` |
| `createdAt` | `LocalDateTime` | Data de criação |
| `updatedAt` | `LocalDateTime` | Data da última atualização |

### DTOs

- `TaskRequestDTO`: usado na criação
- `TaskUpdateDTO`: usado na atualização
- `TaskResponseDTO`: formato da resposta da API

## 📌 Endpoints

| Ação | Método | Rota |
|---|---|---|
| Criar tarefa | `POST` | `/tasks` |
| Listar tarefas | `GET` | `/tasks` |
| Buscar por ID | `GET` | `/tasks/{id}` |
| Atualizar tarefa | `PUT` | `/tasks/{id}` |
| Excluir tarefa | `DELETE` | `/tasks/{id}` |
| Cadastrar usuário | `POST` | `/auth/register` |
| Autenticar usuário | `POST` | `/auth/login` |

Todos os endpoints de `/tasks` exigem o cabeçalho `Authorization: Bearer <token>`.

## 📨 Exemplos de requisição

### Criar tarefa

**POST** `/tasks`

```json
{
  "title": "Estudar Spring Boot",
  "description": "Finalizar o MVP do TaskFlow"
}
```

**Resposta:**

```json
{
  "id": 1,
  "title": "Estudar Spring Boot",
  "description": "Finalizar o MVP do TaskFlow",
  "status": "PENDING",
  "createdAt": "2026-07-02T19:52:46.206034",
  "updatedAt": "2026-07-02T19:52:46.206034"
}
```

### Atualizar tarefa

**PUT** `/tasks/1`

```json
{
  "title": "Estudar Spring Boot avançado",
  "description": "Revisar JPA e validação",
  "status": "IN_PROGRESS"
}
```

## ✅ Regras de negócio e validações

- `title` é obrigatório na criação.
- `status` é definido automaticamente como `PENDING` ao criar a tarefa.
- `id`, `createdAt` e `updatedAt` são controlados pela aplicação.
- Caso o recurso não exista, o serviço lança uma exceção de negócio.

## ⚙️ Como executar localmente

### Pré-requisitos

- Java 21
- MySQL em execução
- Maven ou o wrapper `mvnw`

### 1. Clonar o projeto

```bash
git clone <url-do-repositorio>
```

### 2. Configurar o banco

Edite `src/main/resources/application.properties`:

```properties
spring.application.name=TaskFlow-API
spring.datasource.url=jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true
spring.datasource.username=SEU_USUARIO
spring.datasource.password=SUA_SENHA
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
```

> Em ambientes reais, prefira variáveis de ambiente para não versionar credenciais.

Configure também uma chave JWT com pelo menos 32 caracteres:

```powershell
$env:JWT_SECRET = "uma-chave-secreta-com-pelo-menos-32-caracteres"
```

O tempo de expiração padrão do token é de 24 horas e pode ser alterado pela variável
`JWT_EXPIRATION`, em milissegundos.

### 3. Executar a aplicação

No Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

Em sistemas Unix-like:

```bash
./mvnw spring-boot:run
```

### 4. Acessar a API

```text
http://localhost:8080
```

## 🧪 Testes da API

Ferramentas recomendadas:

- Postman
- Insomnia
- Thunder Client
- curl

## 🗺️ Próximos passos

- [ ] Tratamento global de exceções
- [ ] Filtro por status
- [x] Autenticação com Spring Security + JWT
- [x] Frontend integrado
- [x] Docker e configuração para OCI
- [ ] Campos de prioridade, prazo e responsável
- [ ] Padronização de respostas de erro

## 🚀 Deploy na VM Existente (144.22.158.86)

Este projeto está configurado para deploy na sua VM que já tem o nexus-store e MySQL rodando.

### Estratégia

- **Porta**: 8081 (8080 ocupada pelo nexus-api)
- **MySQL**: Reutiliza o container `nexus-mysql` existente
- **Database**: Cria schema `taskflow_db` no MySQL existente
- **Network**: Conecta à rede `nexus-store_default`
- **Benefício**: Economia de ~300-400MB RAM

### Deploy Rápido

```powershell
# Passo 1: Build e Push (Windows PowerShell)
.\build-and-push.ps1
```

```bash
# Passo 2: Criar database (na VM)
ssh ubuntu@144.22.158.86
cd ~/nexus-store
docker compose exec nexus-mysql sh -c 'mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS taskflow_db;"'
```

```bash
# Passo 3: Deploy (automatizado)
chmod +x deploy-to-vm.sh
./deploy-to-vm.sh
```

### Documentação Completa

Para guia detalhado, veja [DEPLOY-VM-EXISTING.md](DEPLOY-VM-EXISTING.md).

### Frontend

O frontend está integrado na aplicação e servido automaticamente em `src/main/resources/static/`. Quando a API inicia, o frontend é acessível diretamente na URL base.

### Docker

```bash
# Build da imagem
docker build -t taskflow-api:latest .

# Executar com docker-compose
docker-compose up -d

# Para produção (com MySQL externo)
docker-compose -f docker-compose.prod.yml up -d
```

## 📚 O que este projeto demonstra

- Organização de uma API em camadas
- Uso de DTOs para desacoplar persistência e interface
- CRUD com Spring Data JPA
- Validação de entrada com Bean Validation
- Integração com banco relacional MySQL

---

Projeto desenvolvido como parte do meu portfólio em Java e Spring Boot.
