package me.coding.service;

import me.coding.dto.TodoUpdateRequest;
import me.coding.model.Todo;
import me.coding.repository.TodoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TodoService Tests")
class TodoServiceTest {

    @Mock
    private TodoRepository todoRepository;

    @InjectMocks
    private TodoService todoService;

    private Todo testTodo;
    private final Long TODO_ID = 1L;

    @BeforeEach
    void setUp() {
        testTodo = new Todo();
        testTodo.setId(TODO_ID);
        testTodo.setTitle("Test Todo");
        testTodo.setDescription("Test Description");
        testTodo.setCompleted(false);
        testTodo.setImportant(false);
        testTodo.setCategory("Test");
        testTodo.setDueDate(LocalDate.now());
        testTodo.setCreatedAt(LocalDateTime.now());
        testTodo.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("Create Todo Tests")
    class CreateTodoTests {

        @Test
        @DisplayName("Should create todo successfully")
        void shouldCreateTodoSuccessfully() {
            // Given
            Todo todoToCreate = new Todo("New Todo", "New Description");
            Todo savedTodo = new Todo("New Todo", "New Description");
            savedTodo.setId(2L);

            when(todoRepository.save(any(Todo.class))).thenReturn(savedTodo);

            // When
            Todo result = todoService.createTodo(todoToCreate);

            // Then
            assertThat(result, is(notNullValue()));
            assertThat(result.getId(), is(equalTo(2L)));
            assertThat(result.getTitle(), is(equalTo("New Todo")));
            assertThat(result.getDescription(), is(equalTo("New Description")));
            
            verify(todoRepository, times(1)).save(todoToCreate);
        }
    }

    @Nested
    @DisplayName("Get Todo Tests")
    class GetTodoTests {

        @Test
        @DisplayName("Should return all todos")
        void shouldReturnAllTodos() {
            // Given
            List<Todo> expectedTodos = Arrays.asList(testTodo, createAnotherTodo());
            when(todoRepository.findAll()).thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.findAllTodos();

            // Then
            assertThat(result, hasSize(2));
            assertThat(result, containsInAnyOrder(testTodo, expectedTodos.get(1)));
            
            verify(todoRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return todo by id when exists")
        void shouldReturnTodoByIdWhenExists() {
            // Given
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));

            // When
            Optional<Todo> result = todoService.findTodoById(TODO_ID);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(result.get(), is(equalTo(testTodo)));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
        }

        @Test
        @DisplayName("Should return empty when todo not found")
        void shouldReturnEmptyWhenTodoNotFound() {
            // Given
            when(todoRepository.findById(anyLong())).thenReturn(Optional.empty());

            // When
            Optional<Todo> result = todoService.findTodoById(999L);

            // Then
            assertThat(result.isEmpty(), is(true));
            
            verify(todoRepository, times(1)).findById(999L);
        }

        @Test
        @DisplayName("Should return todos by completion status")
        void shouldReturnTodosByCompletionStatus() {
            // Given
            List<Todo> completedTodos = Arrays.asList(testTodo);
            when(todoRepository.findByCompleted(true)).thenReturn(completedTodos);

            // When
            List<Todo> result = todoService.findTodosByStatus(true);

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1)).findByCompleted(true);
        }
    }

    @Nested
    @DisplayName("Update Todo Tests")
    class UpdateTodoTests {

        @Test
        @DisplayName("Should update todo successfully")
        void shouldUpdateTodoSuccessfully() {
            // Given
            Todo updatedTodo = new Todo();
            updatedTodo.setTitle("Updated Title");
            updatedTodo.setDescription("Updated Description");
            updatedTodo.setCompleted(true);
            updatedTodo.setImportant(true);
            updatedTodo.setCategory("Updated Category");
            updatedTodo.setDueDate(LocalDate.now().plusDays(1));

            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.updateTodo(TODO_ID, updatedTodo);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getTitle(), is(equalTo("Updated Title")));
            assertThat(testTodo.getDescription(), is(equalTo("Updated Description")));
            assertThat(testTodo.getCompleted(), is(true));
            assertThat(testTodo.getImportant(), is(true));
            assertThat(testTodo.getCategory(), is(equalTo("Updated Category")));
            assertThat(testTodo.getDueDate(), is(equalTo(LocalDate.now().plusDays(1))));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }

        @Test
        @DisplayName("Should return empty when updating non-existent todo")
        void shouldReturnEmptyWhenUpdatingNonExistentTodo() {
            // Given
            Todo updatedTodo = new Todo();
            when(todoRepository.findById(anyLong())).thenReturn(Optional.empty());

            // When
            Optional<Todo> result = todoService.updateTodo(999L, updatedTodo);

            // Then
            assertThat(result.isEmpty(), is(true));
            
            verify(todoRepository, times(1)).findById(999L);
            verify(todoRepository, never()).save(any(Todo.class));
        }
    }

    @Nested
    @DisplayName("Delete Todo Tests")
    class DeleteTodoTests {

        @Test
        @DisplayName("Should delete todo successfully")
        void shouldDeleteTodoSuccessfully() {
            // Given
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));

            // When
            boolean result = todoService.deleteTodo(TODO_ID);

            // Then
            assertThat(result, is(true));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).delete(testTodo);
        }

        @Test
        @DisplayName("Should return false when deleting non-existent todo")
        void shouldReturnFalseWhenDeletingNonExistentTodo() {
            // Given
            when(todoRepository.findById(anyLong())).thenReturn(Optional.empty());

            // When
            boolean result = todoService.deleteTodo(999L);

            // Then
            assertThat(result, is(false));
            
            verify(todoRepository, times(1)).findById(999L);
            verify(todoRepository, never()).delete(any(Todo.class));
        }
    }

    @Nested
    @DisplayName("Patch Update Tests")
    class PatchUpdateTests {

        @Test
        @DisplayName("Should patch todo as completed")
        void shouldPatchTodoAsCompleted() {
            // Given
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(true);
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.patchTodo(TODO_ID, updateRequest);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getCompleted(), is(true));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }

        @Test
        @DisplayName("Should patch todo as incomplete")
        void shouldPatchTodoAsIncomplete() {
            // Given
            testTodo.setCompleted(true);
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(false);
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.patchTodo(TODO_ID, updateRequest);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getCompleted(), is(false));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }

        @Test
        @DisplayName("Should patch todo as important")
        void shouldPatchTodoAsImportant() {
            // Given
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setImportant(true);
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.patchTodo(TODO_ID, updateRequest);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getImportant(), is(true));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }

        @Test
        @DisplayName("Should patch todo as not important")
        void shouldPatchTodoAsNotImportant() {
            // Given
            testTodo.setImportant(true);
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setImportant(false);
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.patchTodo(TODO_ID, updateRequest);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getImportant(), is(false));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }

        @Test
        @DisplayName("Should return empty when patching non-existent todo")
        void shouldReturnEmptyWhenPatchingNonExistentTodo() {
            // Given
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(true);
            when(todoRepository.findById(anyLong())).thenReturn(Optional.empty());

            // When
            Optional<Todo> result = todoService.patchTodo(999L, updateRequest);

            // Then
            assertThat(result.isEmpty(), is(true));
            
            verify(todoRepository, times(1)).findById(999L);
            verify(todoRepository, never()).save(any(Todo.class));
        }

        @Test
        @DisplayName("Should patch multiple fields")
        void shouldPatchMultipleFields() {
            // Given
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(true);
            updateRequest.setImportant(true);
            updateRequest.setTitle("Updated Title");
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.patchTodo(TODO_ID, updateRequest);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getCompleted(), is(true));
            assertThat(testTodo.getImportant(), is(true));
            assertThat(testTodo.getTitle(), is("Updated Title"));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }

        @Test
        @DisplayName("Should only update specified fields")
        void shouldOnlyUpdateSpecifiedFields() {
            // Given
            String originalTitle = testTodo.getTitle();
            String originalDescription = testTodo.getDescription();
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(true);
            when(todoRepository.findById(TODO_ID)).thenReturn(Optional.of(testTodo));
            when(todoRepository.save(any(Todo.class))).thenReturn(testTodo);

            // When
            Optional<Todo> result = todoService.patchTodo(TODO_ID, updateRequest);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(testTodo.getCompleted(), is(true));
            assertThat(testTodo.getTitle(), is(originalTitle));
            assertThat(testTodo.getDescription(), is(originalDescription));
            
            verify(todoRepository, times(1)).findById(TODO_ID);
            verify(todoRepository, times(1)).save(testTodo);
        }
    }

    @Nested
    @DisplayName("Filter Tests")
    class FilterTests {

        @Test
        @DisplayName("Should filter todos by all parameters")
        void shouldFilterTodosByAllParameters() {
            // Given
            LocalDate testDate = LocalDate.now();
            List<Todo> expectedTodos = Arrays.asList(testTodo);
            
            when(todoRepository.findByDueDateAndImportantAndCategoryAndCompleted(
                testDate, true, "Work", false)).thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.findTodos(false, "Work", true, testDate);

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1))
                .findByDueDateAndImportantAndCategoryAndCompleted(testDate, true, "Work", false);
        }

        @Test
        @DisplayName("Should filter todos by date only")
        void shouldFilterTodosByDateOnly() {
            // Given
            LocalDate testDate = LocalDate.now();
            List<Todo> expectedTodos = Arrays.asList(testTodo);
            
            when(todoRepository.findByDueDate(testDate)).thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.findTodos(null, null, null, testDate);

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1)).findByDueDate(testDate);
        }

        @Test
        @DisplayName("Should return all todos when no filters applied")
        void shouldReturnAllTodosWhenNoFiltersApplied() {
            // Given
            List<Todo> expectedTodos = Arrays.asList(testTodo);
            when(todoRepository.findAll()).thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.findTodos(null, null, null, null);

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1)).findAll();
        }
    }

    @Nested
    @DisplayName("Search Tests")
    class SearchTests {

        @Test
        @DisplayName("Should search todos by term")
        void shouldSearchTodosByTerm() {
            // Given
            String searchTerm = "test";
            List<Todo> expectedTodos = Arrays.asList(testTodo);
            
            when(todoRepository.findByTitleOrDescriptionContaining(searchTerm))
                .thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.searchTodos(searchTerm);

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1))
                .findByTitleOrDescriptionContaining(searchTerm);
        }

        @Test
        @DisplayName("Should return empty list when no search results")
        void shouldReturnEmptyListWhenNoSearchResults() {
            // Given
            String searchTerm = "nonexistent";
            when(todoRepository.findByTitleOrDescriptionContaining(searchTerm))
                .thenReturn(Arrays.asList());

            // When
            List<Todo> result = todoService.searchTodos(searchTerm);

            // Then
            assertThat(result, is(empty()));
            
            verify(todoRepository, times(1))
                .findByTitleOrDescriptionContaining(searchTerm);
        }
    }

    @Nested
    @DisplayName("Today's Todos Tests")
    class TodaysTodosTests {

        @Test
        @DisplayName("Should return today's todos")
        void shouldReturnTodaysTodos() {
            // Given
            List<Todo> expectedTodos = Arrays.asList(testTodo);
            when(todoRepository.findTodaysTodos()).thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.findTodaysTodos();

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1)).findTodaysTodos();
        }

        @Test
        @DisplayName("Should return today's todos by completion status")
        void shouldReturnTodaysTodosByCompletionStatus() {
            // Given
            List<Todo> expectedTodos = Arrays.asList(testTodo);
            when(todoRepository.findTodaysTodosByCompleted(false)).thenReturn(expectedTodos);

            // When
            List<Todo> result = todoService.findTodaysTodos(false);

            // Then
            assertThat(result, hasSize(1));
            assertThat(result, contains(testTodo));
            
            verify(todoRepository, times(1)).findTodaysTodosByCompleted(false);
        }
    }

    private Todo createAnotherTodo() {
        Todo anotherTodo = new Todo();
        anotherTodo.setId(2L);
        anotherTodo.setTitle("Another Todo");
        anotherTodo.setDescription("Another Description");
        anotherTodo.setCompleted(true);
        anotherTodo.setImportant(true);
        anotherTodo.setCategory("Another");
        return anotherTodo;
    }
}