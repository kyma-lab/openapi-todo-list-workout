package me.coding.controller;

import me.coding.dto.DeleteResponse;
import me.coding.dto.ErrorResponse;
import me.coding.dto.TodoUpdateRequest;
import me.coding.exception.ResourceNotFoundException;
import me.coding.model.Todo;
import me.coding.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/todos")
@Tag(name = "Todo Management", description = "Operations for managing todo items")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class TodoController {
    
    private final TodoService todoService;
    
    @GetMapping
    @Operation(summary = "Get all todos", description = "Retrieve all todo items with optional filtering and search")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved todos",
                content = @Content(mediaType = "application/json",
                schema = @Schema(type = "array", implementation = Todo.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Todo List",
                        value = "[{\"id\": 1, \"title\": \"Complete project\", \"description\": \"Finish the todo application\", \"completed\": false, \"important\": true, \"category\": \"Work\", \"dueDate\": \"2024-12-31\", \"createdAt\": \"2024-01-15T10:30:00\", \"updatedAt\": \"2024-01-15T10:30:00\"}]"
                )))
    })
    public ResponseEntity<List<Todo>> list(
            @Parameter(description = "Filter by completion status") 
            @RequestParam(required = false) Boolean completed,
            @Parameter(description = "Filter by category name") 
            @RequestParam(required = false) String category,
            @Parameter(description = "Filter by important status") 
            @RequestParam(required = false) Boolean important,
            @Parameter(description = "Filter by due date (YYYY-MM-DD)") 
            @RequestParam(required = false) LocalDate dueDate,
            @Parameter(description = "Search term to find in title or description") 
            @RequestParam(required = false) String q) {
        log.info("Fetching todos with completed: {}, category: {}, important: {}, dueDate: {}, search: {}", completed, category, important, dueDate, q);
        
        List<Todo> todos;
        if (q != null && !q.trim().isEmpty()) {
            todos = todoService.searchTodos(q.trim());
            log.debug("Found {} todos matching search query: {}", todos.size(), q);
        } else {
            todos = todoService.findTodos(completed, category, important, dueDate);
            log.debug("Retrieved {} todos", todos.size());
        }
        
        return ResponseEntity.ok(todos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get todo by ID", description = "Retrieve a specific todo item by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo found",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Todo.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Single Todo",
                        value = "{\"id\": 1, \"title\": \"Complete project\", \"description\": \"Finish the todo application\", \"completed\": false, \"important\": true, \"category\": \"Work\", \"dueDate\": \"2024-12-31\", \"createdAt\": \"2024-01-15T10:30:00\", \"updatedAt\": \"2024-01-15T10:30:00\"}"
                ))),
        @ApiResponse(responseCode = "404", description = "Todo not found",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Not Found Error",
                        value = "{\"status\": 404, \"message\": \"Resource not found\", \"details\": \"Todo not found with id: 999\", \"timestamp\": \"2024-01-15T10:30:00\", \"path\": \"/api/v1/todos/999\"}"
                )))
    })
    public ResponseEntity<Todo> findById(
            @Parameter(description = "ID of the todo to retrieve") 
            @PathVariable Long id) {
        log.info("Fetching todo with id: {}", id);
        Todo todo = todoService.findTodoById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", id));
        log.debug("Found todo: {}", todo.getTitle());
        return ResponseEntity.ok(todo);
    }
    
    @PostMapping
    @Operation(summary = "Create new todo", description = "Create a new todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Todo created successfully",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Todo.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Created Todo",
                        value = "{\"id\": 1, \"title\": \"New Task\", \"description\": \"Task description\", \"completed\": false, \"important\": false, \"category\": \"Personal\", \"dueDate\": null, \"createdAt\": \"2024-01-15T10:30:00\", \"updatedAt\": \"2024-01-15T10:30:00\"}"
                ))),
        @ApiResponse(responseCode = "400", description = "Invalid input data",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Validation Error",
                        value = "{\"status\": 400, \"message\": \"Validation failed\", \"details\": \"Title is required\", \"timestamp\": \"2024-01-15T10:30:00\", \"path\": \"/api/v1/todos\"}"
                )))
    })
    public ResponseEntity<Todo> create(
            @Parameter(description = "Todo data to create", 
                    examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                            name = "New Todo Request",
                            value = "{\"title\": \"New Task\", \"description\": \"Task description\", \"category\": \"Personal\", \"important\": false, \"dueDate\": \"2024-12-31\"}"
                    ))
            @Valid @RequestBody Todo todo) {
        log.info("Creating new todo: {}", todo.getTitle());
        Todo createdTodo = todoService.createTodo(todo);
        log.info("Successfully created todo with id: {}", createdTodo.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update todo", description = "Update an existing todo item (full replacement)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo updated successfully",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Todo.class))),
        @ApiResponse(responseCode = "404", description = "Todo not found",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Todo> update(
            @Parameter(description = "ID of the todo to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated todo data (full replacement)",
                    examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                            name = "Update Todo Request",
                            value = "{\"title\": \"Updated Task\", \"description\": \"Updated description\", \"completed\": true, \"important\": false, \"category\": \"Work\", \"dueDate\": \"2024-12-31\"}"
                    ))
            @Valid @RequestBody Todo updatedTodo) {
        log.info("Updating todo with id: {}", id);
        Todo todo = todoService.updateTodo(id, updatedTodo)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", id));
        log.info("Successfully updated todo with id: {}", id);
        return ResponseEntity.ok(todo);
    }
    
    @PatchMapping("/{id}")
    @Operation(summary = "Partial update todo", description = "Update specific fields of a todo item (only provided fields will be updated)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo updated successfully",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = Todo.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Patched Todo",
                        value = "{\"id\": 1, \"title\": \"Complete project\", \"description\": \"Finish the todo application\", \"completed\": true, \"important\": true, \"category\": \"Work\", \"dueDate\": \"2024-12-31\", \"createdAt\": \"2024-01-15T10:30:00\", \"updatedAt\": \"2024-01-15T11:00:00\"}"
                ))),
        @ApiResponse(responseCode = "404", description = "Todo not found",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Todo> patchTodo(
            @Parameter(description = "ID of the todo to update") 
            @PathVariable Long id,
            @Parameter(description = "Fields to update (only non-null fields will be updated)", 
                    schema = @Schema(implementation = TodoUpdateRequest.class),
                    examples = {
                            @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    name = "Mark as completed",
                                    value = "{\"completed\": true}"
                            ),
                            @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    name = "Update multiple fields",
                                    value = "{\"completed\": true, \"important\": false, \"title\": \"Updated title\"}"
                            ),
                            @io.swagger.v3.oas.annotations.media.ExampleObject(
                                    name = "Set due date",
                                    value = "{\"dueDate\": \"2024-12-31\"}"
                            )
                    })
            @Valid @RequestBody TodoUpdateRequest updateRequest) {
        log.info("Patching todo with id: {}", id);
        Todo todo = todoService.patchTodo(id, updateRequest)
                .orElseThrow(() -> new ResourceNotFoundException("Todo", id));
        log.info("Successfully patched todo with id: {}", id);
        return ResponseEntity.ok(todo);
    }
    
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete todo", description = "Delete a todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo deleted successfully",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = DeleteResponse.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Delete Confirmation",
                        value = "{\"message\": \"Todo successfully deleted\", \"deletedId\": 1}"
                ))),
        @ApiResponse(responseCode = "404", description = "Todo not found",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<DeleteResponse> delete(
            @Parameter(description = "ID of the todo to delete") 
            @PathVariable Long id) {
        log.info("Deleting todo with id: {}", id);
        if (!todoService.deleteTodo(id)) {
            throw new ResourceNotFoundException("Todo", id);
        }
        log.info("Successfully deleted todo with id: {}", id);
        DeleteResponse response = new DeleteResponse("Todo successfully deleted", id);
        return ResponseEntity.ok(response);
    }
    
    
    @GetMapping("/today")
    @Operation(summary = "Get today's todos", description = "Retrieve todos due today")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Today's todos retrieved",
                content = @Content(mediaType = "application/json",
                schema = @Schema(type = "array", implementation = Todo.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Today's Todos",
                        value = "[{\"id\": 1, \"title\": \"Daily standup\", \"description\": \"Team meeting\", \"completed\": false, \"important\": true, \"category\": \"Work\", \"dueDate\": \"2024-01-15\", \"createdAt\": \"2024-01-15T08:00:00\", \"updatedAt\": \"2024-01-15T08:00:00\"}]"
                )))
    })
    public ResponseEntity<List<Todo>> getTodaysTodos(
            @Parameter(description = "Filter by completion status") 
            @RequestParam(required = false) Boolean completed) {
        log.info("Fetching today's todos with completed filter: {}", completed);
        List<Todo> todos;
        if (completed != null) {
            todos = todoService.findTodaysTodos(completed);
        } else {
            todos = todoService.findTodaysTodos();
        }
        log.debug("Retrieved {} todos for today", todos.size());
        return ResponseEntity.ok(todos);
    }
    
}