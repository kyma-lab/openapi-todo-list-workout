# Todo API

A simple REST API for managing todo items built with Spring Boot, featuring OpenAPI documentation and H2 database.

## Features

- Full CRUD operations for todos
- Search functionality
- Status filtering (completed/incomplete)
- OpenAPI/Swagger documentation
- H2 in-memory database
- Input validation
- Apache License

## Quick Start

### Prerequisites

- Java 17 or higher
- Maven (or use IntelliJ IDEA's embedded Maven)

### Running the Application

1. **Clone or download the project**

2. **Run using IntelliJ IDEA:**
   - Open the project in IntelliJ IDEA
   - Run the `TodoApiApplication` main class
   - Or use the provided `mb.run` script

3. **Run using Maven:**
   ```bash
   mvn spring-boot:run
   ```

4. **Access the application:**
   - API Base URL: http://localhost:8080/api/v1/todos
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - H2 Console: http://localhost:8080/h2-console

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/todos` | Get all todos (with optional `completed` filter) |
| GET | `/api/v1/todos/{id}` | Get todo by ID |
| POST | `/api/v1/todos` | Create new todo |
| PUT | `/api/v1/todos/{id}` | Update existing todo |
| PATCH | `/api/v1/todos/{id}/complete` | Mark todo as completed |
| PATCH | `/api/v1/todos/{id}/incomplete` | Mark todo as incomplete |
| DELETE | `/api/v1/todos/{id}` | Delete todo |
| GET | `/api/v1/todos/search?q=term` | Search todos by title or description |

## Example Usage

### Create a Todo
```bash
curl -X POST http://localhost:8080/api/v1/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, bread, eggs"}'
```

### Get All Todos
```bash
curl http://localhost:8080/api/v1/todos
```

### Mark Todo as Complete
```bash
curl -X PATCH http://localhost:8080/api/v1/todos/1/complete
```

## Testing

Use the provided `todo-api.http` file in IntelliJ IDEA to test all endpoints interactively.

## Database

The application uses H2 in-memory database. Data is reset on each restart.

- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:tododb`
- **Username**: `sa`
- **Password**: (empty)

## Documentation

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/v3/api-docs

## Project Structure

```
src/main/java/me/coding/
├── TodoApiApplication.java    # Main application class
├── controller/
│   └── TodoController.java    # REST endpoints
├── service/
│   └── TodoService.java       # Business logic
├── repository/
│   └── TodoRepository.java    # Data access
├── model/
│   └── Todo.java              # Entity model
└── config/
    └── OpenApiConfig.java     # API documentation config
```

## Technologies Used

- Spring Boot 3.2.0
- Spring Data JPA
- Spring Web
- H2 Database
- SpringDoc OpenAPI
- Lombok
- Bean Validation

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.