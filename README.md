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

## 🛠️ Tecnologias

- Java 21
- Spring Boot 4
- Spring Web / Spring MVC
- Spring Data JPA
- Bean Validation
- MySQL
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
└── Services
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
- [ ] Autenticação com Spring Security + JWT
- [ ] Campos de prioridade, prazo e responsável
- [ ] Padronização de respostas de erro

## 📚 O que este projeto demonstra

- Organização de uma API em camadas
- Uso de DTOs para desacoplar persistência e interface
- CRUD com Spring Data JPA
- Validação de entrada com Bean Validation
- Integração com banco relacional MySQL

---

Projeto desenvolvido como parte do meu portfólio em Java e Spring Boot.
