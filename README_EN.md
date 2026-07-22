# 🚀 TaskFlow API

TaskFlow is a REST API for task management, built as a portfolio project with a focus on clean structure, clarity, and backend best practices using Java and Spring Boot.

It allows you to create, list, retrieve, update, and delete tasks, serving as a foundation for a future productivity platform, front-end integration, or further business features.

## ✨ Highlights

- Full task CRUD
- Clear layered architecture
- DTO-based input and output
- MySQL persistence with JPA/Hibernate
- Input validation with Bean Validation
- Proper HTTP responses for each operation

## 🛠️ Tech Stack

- Java 21
- Spring Boot 4
- Spring Web / Spring MVC
- Spring Data JPA
- Bean Validation
- MySQL
- Maven

## 🏗️ Architecture

```text
Controller → Service → Repository → Database
```

- **Controller**: exposes HTTP endpoints
- **Service**: contains business rules
- **Repository**: handles data access
- **DTOs**: define request and response formats
- **Entity**: represents the `task` table

## 📦 Project Structure

```text
src/main/java/com/portfolio/TaskFlow/API
├── Controllers
├── Dto
├── Entities
├── Repositories
└── Services
```

## 📋 Data Model

### `Task`

| Field | Type | Description |
|---|---|---|
| `id` | `Long` | Task identifier |
| `title` | `String` | Task title |
| `description` | `String` | Optional description |
| `status` | `Enum` | `PENDING`, `IN_PROGRESS`, or `COMPLETED` |
| `createdAt` | `LocalDateTime` | Creation date |
| `updatedAt` | `LocalDateTime` | Last update date |

### DTOs

- `TaskRequestDTO`: used for task creation
- `TaskUpdateDTO`: used for updates
- `TaskResponseDTO`: API response payload

## 📌 Endpoints

| Action | Method | Route |
|---|---|---|
| Create task | `POST` | `/tasks` |
| List tasks | `GET` | `/tasks` |
| Get task by ID | `GET` | `/tasks/{id}` |
| Update task | `PUT` | `/tasks/{id}` |
| Delete task | `DELETE` | `/tasks/{id}` |

## 📨 Request Examples

### Create task

**POST** `/tasks`

```json
{
  "title": "Study Spring Boot",
  "description": "Finish the TaskFlow MVP"
}
```

**Response:**

```json
{
  "id": 1,
  "title": "Study Spring Boot",
  "description": "Finish the TaskFlow MVP",
  "status": "PENDING",
  "createdAt": "2026-07-02T19:52:46.206034",
  "updatedAt": "2026-07-02T19:52:46.206034"
}
```

### Update task

**PUT** `/tasks/1`

```json
{
  "title": "Study advanced Spring Boot",
  "description": "Review JPA and validation",
  "status": "IN_PROGRESS"
}
```

## ✅ Business Rules and Validation

- `title` is required when creating a task.
- `status` is automatically set to `PENDING` on creation.
- `id`, `createdAt`, and `updatedAt` are managed by the application.
- If the resource does not exist, the service throws a business exception.

## ⚙️ Running Locally

### Requirements

- Java 21
- MySQL running locally
- Maven or the included `mvnw` wrapper

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Configure the database

Edit `src/main/resources/application.properties`:

```properties
spring.application.name=TaskFlow-API
spring.datasource.url=jdbc:mysql://localhost:3306/taskflow_db?createDatabaseIfNotExist=true
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
```

> In real-world projects, prefer environment variables instead of committing credentials.

### 3. Start the application

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

On Unix-like systems:

```bash
./mvnw spring-boot:run
```

### 4. Access the API

```text
http://localhost:8080
```

## 🧪 Testing the API

Recommended tools:

- Postman
- Insomnia
- Thunder Client
- curl

## 🗺️ Roadmap

- [ ] Global exception handling
- [ ] Filter tasks by status
- [ ] Authentication with Spring Security + JWT
- [ ] Priority, deadline, and assignee fields
- [ ] Standardized error responses

## 📚 What this project demonstrates

- Layered API organization
- DTO usage to decouple persistence and API contracts
- CRUD with Spring Data JPA
- Input validation with Bean Validation
- Integration with a relational MySQL database

---

Project developed as part of my Java and Spring Boot portfolio.

