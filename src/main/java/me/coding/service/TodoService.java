package me.coding.service;

import me.coding.dto.TodoUpdateRequest;
import me.coding.model.Todo;
import me.coding.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TodoService {
    
    private final TodoRepository todoRepository;
    
    public List<Todo> findAllTodos() {
        log.debug("Fetching all todos from database");
        List<Todo> todos = todoRepository.findAll();
        log.debug("Retrieved {} todos from database", todos.size());
        return todos;
    }
    
    public Optional<Todo> findTodoById(Long id) {
        log.debug("Fetching todo by id: {}", id);
        Optional<Todo> todo = todoRepository.findById(id);
        if (todo.isPresent()) {
            log.debug("Found todo with id: {}", id);
        } else {
            log.debug("No todo found with id: {}", id);
        }
        return todo;
    }
    
    public Todo createTodo(Todo todo) {
        log.info("Creating new todo: {}", todo.getTitle());
        Todo savedTodo = todoRepository.save(todo);
        log.info("Successfully created todo with id: {} and title: {}", savedTodo.getId(), savedTodo.getTitle());
        return savedTodo;
    }
    
    public Optional<Todo> updateTodo(Long id, Todo updatedTodo) {
        log.debug("Updating todo with id: {}", id);
        return todoRepository.findById(id)
                .map(todo -> {
                    log.debug("Found existing todo, updating fields for id: {}", id);
                    todo.setTitle(updatedTodo.getTitle());
                    todo.setDescription(updatedTodo.getDescription());
                    todo.setCompleted(updatedTodo.getCompleted());
                    todo.setCategory(updatedTodo.getCategory());
                    todo.setImportant(updatedTodo.getImportant());
                    todo.setDueDate(updatedTodo.getDueDate());
                    Todo savedTodo = todoRepository.save(todo);
                    log.info("Successfully updated todo with id: {}", id);
                    return savedTodo;
                });
    }
    
    public Optional<Todo> patchTodo(Long id, TodoUpdateRequest updateRequest) {
        log.debug("Patching todo with id: {}", id);
        return todoRepository.findById(id)
                .map(todo -> {
                    log.debug("Found existing todo, applying partial updates for id: {}", id);
                    
                    // Only update fields that are present in the request
                    if (updateRequest.hasTitle()) {
                        todo.setTitle(updateRequest.getTitle());
                        log.debug("Updated title for todo {}", id);
                    }
                    
                    if (updateRequest.hasDescription()) {
                        todo.setDescription(updateRequest.getDescription());
                        log.debug("Updated description for todo {}", id);
                    }
                    
                    if (updateRequest.hasCompleted()) {
                        todo.setCompleted(updateRequest.getCompleted());
                        log.debug("Updated completed status to {} for todo {}", updateRequest.getCompleted(), id);
                    }
                    
                    if (updateRequest.hasImportant()) {
                        todo.setImportant(updateRequest.getImportant());
                        log.debug("Updated important status to {} for todo {}", updateRequest.getImportant(), id);
                    }
                    
                    if (updateRequest.hasCategory()) {
                        todo.setCategory(updateRequest.getCategory());
                        log.debug("Updated category for todo {}", id);
                    }
                    
                    if (updateRequest.hasDueDate()) {
                        todo.setDueDate(updateRequest.getDueDate());
                        log.debug("Updated due date for todo {}", id);
                    }
                    
                    Todo savedTodo = todoRepository.save(todo);
                    log.info("Successfully patched todo with id: {}", id);
                    return savedTodo;
                });
    }
    
    public boolean deleteTodo(Long id) {
        log.debug("Attempting to delete todo with id: {}", id);
        return todoRepository.findById(id)
                .map(todo -> {
                    todoRepository.delete(todo);
                    log.info("Successfully deleted todo with id: {}", id);
                    return true;
                })
                .orElseGet(() -> {
                    log.debug("Todo not found for deletion with id: {}", id);
                    return false;
                });
    }
    
    public List<Todo> findTodosByStatus(Boolean completed) {
        log.debug("Fetching todos by completion status: {}", completed);
        List<Todo> todos = todoRepository.findByCompleted(completed);
        log.debug("Found {} todos with completion status: {}", todos.size(), completed);
        return todos;
    }
    
    public List<Todo> findTodos(Boolean completed, String category) {
        log.debug("Fetching todos with completed status: {} and category: {}", completed, category);
        
        List<Todo> todos;
        
        if (completed != null && category != null && !category.trim().isEmpty()) {
            // Both filters specified
            todos = todoRepository.findByCategoryAndCompleted(category.trim(), completed);
            log.debug("Retrieved {} todos with category: {} and completed: {}", todos.size(), category, completed);
        } else if (category != null && !category.trim().isEmpty()) {
            // Only category filter specified
            todos = todoRepository.findByCategory(category.trim());
            log.debug("Retrieved {} todos with category: {}", todos.size(), category);
        } else if (completed != null) {
            // Only completed filter specified
            todos = todoRepository.findByCompleted(completed);
            log.debug("Retrieved {} todos with completed: {}", todos.size(), completed);
        } else {
            // No filters specified
            todos = todoRepository.findAll();
            log.debug("Retrieved {} todos (no filters)", todos.size());
        }
        
        return todos;
    }
    
    public List<Todo> findTodos(Boolean completed, String category, Boolean important) {
        log.debug("Fetching todos with completed: {}, category: {}, important: {}", completed, category, important);
        
        List<Todo> todos;
        
        // Handle all combinations of filters
        if (completed != null && category != null && !category.trim().isEmpty() && important != null) {
            // All three filters specified
            todos = todoRepository.findByImportantAndCategoryAndCompleted(important, category.trim(), completed);
            log.debug("Retrieved {} todos with important: {}, category: {}, completed: {}", todos.size(), important, category, completed);
        } else if (important != null && category != null && !category.trim().isEmpty()) {
            // Important and category filters specified
            todos = todoRepository.findByImportantAndCategory(important, category.trim());
            log.debug("Retrieved {} todos with important: {} and category: {}", todos.size(), important, category);
        } else if (important != null && completed != null) {
            // Important and completed filters specified
            todos = todoRepository.findByImportantAndCompleted(important, completed);
            log.debug("Retrieved {} todos with important: {} and completed: {}", todos.size(), important, completed);
        } else if (completed != null && category != null && !category.trim().isEmpty()) {
            // Category and completed filters specified
            todos = todoRepository.findByCategoryAndCompleted(category.trim(), completed);
            log.debug("Retrieved {} todos with category: {} and completed: {}", todos.size(), category, completed);
        } else if (important != null) {
            // Only important filter specified
            todos = todoRepository.findByImportant(important);
            log.debug("Retrieved {} todos with important: {}", todos.size(), important);
        } else if (category != null && !category.trim().isEmpty()) {
            // Only category filter specified
            todos = todoRepository.findByCategory(category.trim());
            log.debug("Retrieved {} todos with category: {}", todos.size(), category);
        } else if (completed != null) {
            // Only completed filter specified
            todos = todoRepository.findByCompleted(completed);
            log.debug("Retrieved {} todos with completed: {}", todos.size(), completed);
        } else {
            // No filters specified
            todos = todoRepository.findAll();
            log.debug("Retrieved {} todos (no filters)", todos.size());
        }
        
        return todos;
    }
    
    public List<Todo> findTodos(Boolean completed, String category, Boolean important, LocalDate dueDate) {
        log.debug("Fetching todos with completed: {}, category: {}, important: {}, dueDate: {}", completed, category, important, dueDate);
        
        List<Todo> todos;
        
        // Handle all combinations of filters including date
        if (dueDate != null && completed != null && category != null && !category.trim().isEmpty() && important != null) {
            // All four filters specified
            todos = todoRepository.findByDueDateAndImportantAndCategoryAndCompleted(dueDate, important, category.trim(), completed);
            log.debug("Retrieved {} todos with dueDate: {}, important: {}, category: {}, completed: {}", todos.size(), dueDate, important, category, completed);
        } else if (dueDate != null && important != null && category != null && !category.trim().isEmpty()) {
            // Date, important and category filters
            todos = todoRepository.findByDueDateAndImportantAndCategory(dueDate, important, category.trim());
            log.debug("Retrieved {} todos with dueDate: {}, important: {}, category: {}", todos.size(), dueDate, important, category);
        } else if (dueDate != null && category != null && !category.trim().isEmpty() && completed != null) {
            // Date, category and completed filters
            todos = todoRepository.findByDueDateAndCategoryAndCompleted(dueDate, category.trim(), completed);
            log.debug("Retrieved {} todos with dueDate: {}, category: {}, completed: {}", todos.size(), dueDate, category, completed);
        } else if (dueDate != null && important != null && completed != null) {
            // Date, important and completed filters
            todos = todoRepository.findByDueDateAndImportantAndCompleted(dueDate, important, completed);
            log.debug("Retrieved {} todos with dueDate: {}, important: {}, completed: {}", todos.size(), dueDate, important, completed);
        } else if (dueDate != null && important != null) {
            // Date and important filters
            todos = todoRepository.findByDueDateAndImportant(dueDate, important);
            log.debug("Retrieved {} todos with dueDate: {} and important: {}", todos.size(), dueDate, important);
        } else if (dueDate != null && category != null && !category.trim().isEmpty()) {
            // Date and category filters
            todos = todoRepository.findByDueDateAndCategory(dueDate, category.trim());
            log.debug("Retrieved {} todos with dueDate: {} and category: {}", todos.size(), dueDate, category);
        } else if (dueDate != null && completed != null) {
            // Date and completed filters
            todos = todoRepository.findByDueDateAndCompleted(dueDate, completed);
            log.debug("Retrieved {} todos with dueDate: {} and completed: {}", todos.size(), dueDate, completed);
        } else if (dueDate != null) {
            // Only date filter specified
            todos = todoRepository.findByDueDate(dueDate);
            log.debug("Retrieved {} todos with dueDate: {}", todos.size(), dueDate);
        } else {
            // No date filter - use existing logic
            todos = findTodos(completed, category, important);
        }
        
        return todos;
    }
    
    public List<Todo> findTodaysTodos() {
        log.debug("Fetching today's todos");
        List<Todo> todos = todoRepository.findTodaysTodos();
        log.debug("Retrieved {} todos for today", todos.size());
        return todos;
    }
    
    public List<Todo> findTodaysTodos(Boolean completed) {
        log.debug("Fetching today's todos with completed: {}", completed);
        List<Todo> todos = todoRepository.findTodaysTodosByCompleted(completed);
        log.debug("Retrieved {} todos for today with completed: {}", todos.size(), completed);
        return todos;
    }
    
    public List<Todo> findTodosByDate(LocalDate date) {
        log.debug("Fetching todos for date: {}", date);
        List<Todo> todos = todoRepository.findByDueDate(date);
        log.debug("Retrieved {} todos for date: {}", todos.size(), date);
        return todos;
    }
    
    public List<Todo> searchTodos(String searchTerm) {
        log.debug("Searching todos with term: {}", searchTerm);
        List<Todo> todos = todoRepository.findByTitleOrDescriptionContaining(searchTerm);
        log.debug("Found {} todos matching search term: {}", todos.size(), searchTerm);
        return todos;
    }
    
}