package me.coding.controller;

import me.coding.model.Todo;
import me.coding.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/todos")
@Tag(name = "Todo Management", description = "Operations for managing todo items")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class TodoController {
    
    private final TodoService todoService;
    
    @GetMapping
    @Operation(summary = "Get all todos", description = "Retrieve all todo items")
    @ApiResponse(responseCode = "200", description = "Successfully retrieved todos")
    public ResponseEntity<List<Todo>> list(
            @Parameter(description = "Filter by completion status") 
            @RequestParam(required = false) Boolean completed) {
        log.info("Fetching todos with completed filter: {}", completed);
        List<Todo> todos;
        if (completed != null) {
            todos = todoService.getTodosByStatus(completed);
        } else {
            todos = todoService.getAllTodos();
        }
        log.debug("Retrieved {} todos", todos.size());
        return ResponseEntity.ok(todos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get todo by ID", description = "Retrieve a specific todo item by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo found"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    public ResponseEntity<Todo> findById(
            @Parameter(description = "ID of the todo to retrieve") 
            @PathVariable Long id) {
        log.info("Fetching todo with id: {}", id);
        return todoService.getTodoById(id)
                .map(todo -> {
                    log.debug("Found todo: {}", todo.getTitle());
                    return ResponseEntity.ok(todo);
                })
                .orElseGet(() -> {
                    log.warn("Todo not found with id: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    @PostMapping
    @Operation(summary = "Create new todo", description = "Create a new todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Todo created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<Todo> create(
            @Parameter(description = "Todo data to create") 
            @Valid @RequestBody Todo todo) {
        log.info("Creating new todo: {}", todo.getTitle());
        Todo createdTodo = todoService.createTodo(todo);
        log.info("Successfully created todo with id: {}", createdTodo.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTodo);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update todo", description = "Update an existing todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo updated successfully"),
        @ApiResponse(responseCode = "404", description = "Todo not found"),
        @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    public ResponseEntity<Todo> update(
            @Parameter(description = "ID of the todo to update") 
            @PathVariable Long id,
            @Parameter(description = "Updated todo data") 
            @Valid @RequestBody Todo updatedTodo) {
        log.info("Updating todo with id: {}", id);
        return todoService.updateTodo(id, updatedTodo)
                .map(todo -> {
                    log.info("Successfully updated todo with id: {}", id);
                    return ResponseEntity.ok(todo);
                })
                .orElseGet(() -> {
                    log.warn("Todo not found for update with id: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    @PatchMapping("/{id}/complete")
    @Operation(summary = "Mark todo as completed", description = "Mark a todo item as completed")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo marked as completed"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    public ResponseEntity<Todo> complete(
            @Parameter(description = "ID of the todo to mark as completed") 
            @PathVariable Long id) {
        log.info("Marking todo as completed with id: {}", id);
        return todoService.markAsCompleted(id)
                .map(todo -> {
                    log.info("Successfully marked todo as completed with id: {}", id);
                    return ResponseEntity.ok(todo);
                })
                .orElseGet(() -> {
                    log.warn("Todo not found for completion with id: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    @PatchMapping("/{id}/incomplete")
    @Operation(summary = "Mark todo as incomplete", description = "Mark a todo item as incomplete")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo marked as incomplete"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    public ResponseEntity<Todo> incomplete(
            @Parameter(description = "ID of the todo to mark as incomplete") 
            @PathVariable Long id) {
        log.info("Marking todo as incomplete with id: {}", id);
        return todoService.markAsIncomplete(id)
                .map(todo -> {
                    log.info("Successfully marked todo as incomplete with id: {}", id);
                    return ResponseEntity.ok(todo);
                })
                .orElseGet(() -> {
                    log.warn("Todo not found for marking incomplete with id: {}", id);
                    return ResponseEntity.notFound().build();
                });
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete todo", description = "Delete a todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Todo deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    public ResponseEntity<Void> delete(
            @Parameter(description = "ID of the todo to delete") 
            @PathVariable Long id) {
        log.info("Deleting todo with id: {}", id);
        if (todoService.deleteTodo(id)) {
            log.info("Successfully deleted todo with id: {}", id);
            return ResponseEntity.noContent().build();
        }
        log.warn("Todo not found for deletion with id: {}", id);
        return ResponseEntity.notFound().build();
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search todos", description = "Search todos by title or description")
    @ApiResponse(responseCode = "200", description = "Search results retrieved")
    public ResponseEntity<List<Todo>> search(
            @Parameter(description = "Search term to find in title or description") 
            @RequestParam String q) {
        log.info("Searching todos with query: {}", q);
        List<Todo> todos = todoService.searchTodos(q);
        log.debug("Found {} todos matching search query: {}", todos.size(), q);
        return ResponseEntity.ok(todos);
    }
}