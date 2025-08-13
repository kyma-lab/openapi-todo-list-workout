# Todo Kodo - Full-Stack Todo Application

A modern full-stack todo application built with Spring Boot backend and Next.js frontend, featuring category management, task filtering, and responsive design.

## Architecture Overview

This is a multi-repository project consisting of:

- **Backend**: Spring Boot REST API with OpenAPI documentation
- **Frontend**: Next.js React application with TypeScript

## Quick Start

### Prerequisites

- **Backend**: Java 21, Maven
- **Frontend**: Node.js 18+, npm/yarn
- **Database**: H2 (in-memory, no setup required)

### Running the Application

1. **Start the Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   - API: http://localhost:8080/api/v1/todos
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - H2 Console: http://localhost:8080/h2-console

2. **Start the Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   - Frontend: http://localhost:3000

## Features

### Backend (Spring Boot)
- **REST API** with resource-oriented endpoints
- **Category Management** with full CRUD operations
- **Todo Management** with filtering and search
- **OpenAPI/Swagger** documentation
- **Comprehensive Testing** (130+ passing tests)
- **Global Exception Handling** with structured error responses
- **H2 Database** for development

### Frontend (Next.js)
- **Modern React** with TypeScript
- **Multiple Views**: My Day, Important, All Tasks, Category-specific
- **Responsive Design** with Tailwind CSS
- **State Management** with Zustand
- **API Integration** with TanStack Query
- **E2E Testing** with Playwright
- **Unit Testing** with Vitest
- **Component Library** with shadcn/ui

## API Endpoints

### Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/todos` | Get all todos (with optional filters) |
| POST | `/api/v1/todos` | Create new todo |
| GET | `/api/v1/todos/{id}` | Get todo by ID |
| PATCH | `/api/v1/todos/{id}` | Update todo |
| DELETE | `/api/v1/todos/{id}` | Delete todo |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/categories` | Get all categories |
| POST | `/api/v1/categories` | Create new category |
| GET | `/api/v1/categories/{id}` | Get category by ID |
| PATCH | `/api/v1/categories/{id}` | Update category |
| DELETE | `/api/v1/categories/{id}` | Delete category |


## Testing

### Backend
```bash
cd backend
mvn test
```

### Frontend
```bash
cd frontend
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run type-check    # TypeScript validation
npm run lint          # ESLint
```

## Project Structure

```
├── backend/                 # Spring Boot API
│   ├── src/main/java/
│   │   └── me/coding/
│   │       ├── controller/  # REST endpoints
│   │       ├── service/     # Business logic
│   │       ├── repository/  # Data access
│   │       ├── model/       # JPA entities
│   │       └── dto/         # Data transfer objects
│   ├── src/test/           # Test suite
│   └── todo-api.http       # API testing file
│
└── frontend/               # Next.js application
    ├── app/                # Next.js app router
    │   ├── features/       # Feature modules
    │   └── shared/         # Shared components/hooks
    ├── components/         # shadcn/ui components
    ├── tests/              # Test suites
    └── specs/              # Requirements & design docs
```

## Technologies Used

### Backend
- **Spring Boot 3.2.0** - Main framework
- **Spring Data JPA** - Database ORM
- **H2 Database** - In-memory database
- **SpringDoc OpenAPI** - API documentation
- **Lombok** - Code generation
- **Maven** - Build tool

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Zustand** - State management
- **TanStack Query** - Data fetching
- **Playwright** - E2E testing
- **Vitest** - Unit testing

## Database Access

- **H2 Console**: http://localhost:8080/h2-console
- **JDBC URL**: `jdbc:h2:mem:tododb`
- **Username**: `sa`
- **Password**: (empty)

## Documentation

- **API Documentation**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/v3/api-docs
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend Specs**: [frontend/specs/](frontend/specs/)

## License

This project is licensed under the Apache License 2.0.