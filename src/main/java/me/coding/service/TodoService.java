package me.coding.service;

import me.coding.model.Todo;
import me.coding.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TodoService {
    
    private final TodoRepository todoRepository;
    
    public List<Todo> getAllTodos() {
        log.debug("Fetching all todos from database");
        List<Todo> todos = todoRepository.findAll();
        log.debug("Retrieved {} todos from database", todos.size());
        return todos;
    }
    
    public Optional<Todo> getTodoById(Long id) {
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
                    Todo savedTodo = todoRepository.save(todo);
                    log.info("Successfully updated todo with id: {}", id);
                    return savedTodo;
                });
    }
    
    public boolean deleteTodo(Long id) {
        log.debug("Attempting to delete todo with id: {}", id);
        if (todoRepository.existsById(id)) {
            todoRepository.deleteById(id);
            log.info("Successfully deleted todo with id: {}", id);
            return true;
        }
        log.debug("Todo not found for deletion with id: {}", id);
        return false;
    }
    
    public List<Todo> getTodosByStatus(Boolean completed) {
        log.debug("Fetching todos by completion status: {}", completed);
        List<Todo> todos = todoRepository.findByCompletedOrderByCreatedAtDesc(completed);
        log.debug("Found {} todos with completion status: {}", todos.size(), completed);
        return todos;
    }
    
    public List<Todo> searchTodos(String searchTerm) {
        log.debug("Searching todos with term: {}", searchTerm);
        List<Todo> todos = todoRepository.findByTitleOrDescriptionContaining(searchTerm);
        log.debug("Found {} todos matching search term: {}", todos.size(), searchTerm);
        return todos;
    }
    
    public Optional<Todo> markAsCompleted(Long id) {
        log.debug("Marking todo as completed with id: {}", id);
        return todoRepository.findById(id)
                .map(todo -> {
                    todo.setCompleted(true);
                    Todo savedTodo = todoRepository.save(todo);
                    log.info("Successfully marked todo as completed with id: {}", id);
                    return savedTodo;
                });
    }
    
    public Optional<Todo> markAsIncomplete(Long id) {
        log.debug("Marking todo as incomplete with id: {}", id);
        return todoRepository.findById(id)
                .map(todo -> {
                    todo.setCompleted(false);
                    Todo savedTodo = todoRepository.save(todo);
                    log.info("Successfully marked todo as incomplete with id: {}", id);
                    return savedTodo;
                });
    }
}