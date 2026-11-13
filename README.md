# 🚀 TaskFlow API

API REST para gerenciamento de tarefas, desenvolvida como projeto de portfólio com Java 21 e Spring Boot 4, com autenticação JWT, frontend estático integrado e suporte a execução com Docker.

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
- Docker pronto para deploy em uma VM com Docker

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
Frontend → API REST → Service → Repository → MySQL
```

- **Controller**: expõe os endpoints HTTP
- **Service**: concentra as regras de negócio
- **Repository**: realiza o acesso aos dados
- **DTOs**: controlam o formato de entrada e saída
- **Entities**: representam a tabela `task` e a tabela `users`
- **Security**: implementa autenticação stateless com Spring Security e JWT

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

O frontend está em `src/main/resources/static/` e é servido pela própria aplicação Spring Boot.

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

### `User`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `Long` | Identificador do usuário |
| `name` | `String` | Nome do usuário |
| `email` | `String` | E-mail único usado no login |
| `password` | `String` | Senha armazenada com BCrypt |
| `role` | `Enum` | `USER` ou `ADMIN` |

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

Os endpoints de `/auth/**` são públicos. Os endpoints de `/tasks` exigem o cabeçalho `Authorization: Bearer <token>`.

### Cadastrar usuário

**POST** `/auth/register`

```json
{
  "name": "Maria Silva",
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

### Autenticar usuário

**POST** `/auth/login`

```json
{
  "email": "maria@example.com",
  "password": "senha-segura"
}
```

A resposta de cadastro e login contém um token JWT:

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "name": "Maria Silva",
  "email": "maria@example.com",
  "role": "USER"
}
```

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

Configure o banco e as variáveis de ambiente. O arquivo
`src/main/resources/application.properties` usa:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=${MINHA_SENHA}
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

Defina as variáveis antes de iniciar a aplicação. A chave JWT deve ter pelo menos 32 caracteres:

```powershell
$env:MINHA_SENHA = "sua-senha-do-mysql"
$env:JWT_SECRET = "uma-chave-secreta-com-pelo-menos-32-caracteres"
$env:JWT_EXPIRATION = "86400000"
```

`JWT_EXPIRATION` é opcional, usa milissegundos e tem valor padrão de 24 horas.
Nunca versione credenciais ou chaves reais. Para o ambiente com Docker e MySQL externo,
consulte [.env.shared-mysql.example](.env.shared-mysql.example).

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

Execute os testes automatizados com:

```powershell
.\mvnw.cmd test
```

Em sistemas Unix-like:

```bash
./mvnw test
```

Para testar os endpoints manualmente, use:

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

## 🚀 Deploy com Docker

### Execução local com a imagem

```bash
docker build -t taskflow-api:latest .
docker run --rm -p 8080:8080 \
  -e MINHA_SENHA="sua-senha-do-mysql" \
  -e JWT_SECRET="uma-chave-secreta-com-pelo-menos-32-caracteres" \
  taskflow-api:latest
```

### Deploy em VM com MySQL externo

O arquivo `docker-compose.shared-mysql.yml` configura a aplicação para reutilizar
um MySQL externo acessível pelo container `nexus-mysql`. Copie o arquivo de exemplo
e preencha os valores reais:

```bash
cp .env.shared-mysql.example .env
docker compose -f docker-compose.shared-mysql.yml --env-file .env up -d
```

No Windows PowerShell, o build e o envio da imagem para o Docker Hub podem ser feitos com:

```powershell
.\build-and-push.ps1
```

O compose publica a aplicação na porta `8081` da VM e usa a porta `8080` internamente.
O Docker Hub utilizado pelo script é `devpetter/taskflow-api`.

Para um ambiente com uma instalação existente do Nexus Store, a rede Docker externa
deve existir com o nome configurado em `docker-compose.shared-mysql.yml`:

Para o procedimento completo de uma VM já existente, consulte
[DEPLOY-VM-EXISTING.md](DEPLOY-VM-EXISTING.md) e
[DEPLOYMENT-OPTIONS.md](DEPLOYMENT-OPTIONS.md).

## 📚 O que este projeto demonstra

- Organização de uma API em camadas
- Uso de DTOs para desacoplar persistência e interface
- CRUD com Spring Data JPA
- Validação de entrada com Bean Validation
- Integração com banco relacional MySQL
- Autenticação stateless com Spring Security e JWT
- Frontend estático servido pela API
- Containerização com Docker e execução em VM

---

Projeto desenvolvido como parte do meu portfólio em Java e Spring Boot.
