package me.coding.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.coding.dto.TodoUpdateRequest;
import me.coding.model.Todo;
import me.coding.service.TodoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TodoController.class)
@DisplayName("TodoController Tests")
class TodoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TodoService todoService;

    @Autowired
    private ObjectMapper objectMapper;

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
        testTodo.setDueDate(LocalDate.of(2024, 1, 15));
        testTodo.setCreatedAt(LocalDateTime.now());
        testTodo.setUpdatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("GET /api/v1/todos Tests")
    class GetTodosTests {

        @Test
        @DisplayName("Should return all todos")
        void shouldReturnAllTodos() throws Exception {
            // Given
            List<Todo> todos = Arrays.asList(testTodo, createAnotherTodo());
            when(todoService.findTodos(null, null, null, null)).thenReturn(todos);

            // When & Then
            mockMvc.perform(get("/api/v1/todos"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id", is(1)))
                    .andExpect(jsonPath("$[0].title", is("Test Todo")))
                    .andExpect(jsonPath("$[0].completed", is(false)))
                    .andExpect(jsonPath("$[0].important", is(false)))
                    .andExpect(jsonPath("$[0].category", is("Test")))
                    .andExpect(jsonPath("$[1].id", is(2)));

            verify(todoService, times(1)).findTodos(null, null, null, null);
        }

        @Test
        @DisplayName("Should filter todos by completion status")
        void shouldFilterTodosByCompletionStatus() throws Exception {
            // Given
            List<Todo> completedTodos = Collections.singletonList(testTodo);
            when(todoService.findTodos(true, null, null, null)).thenReturn(completedTodos);

            // When & Then
            mockMvc.perform(get("/api/v1/todos")
                            .param("completed", "true"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is(1)));

            verify(todoService, times(1)).findTodos(true, null, null, null);
        }

        @Test
        @DisplayName("Should filter todos by all parameters")
        void shouldFilterTodosByAllParameters() throws Exception {
            // Given
            List<Todo> filteredTodos = Collections.singletonList(testTodo);
            when(todoService.findTodos(false, "Work", true, LocalDate.of(2024, 1, 15)))
                    .thenReturn(filteredTodos);

            // When & Then
            mockMvc.perform(get("/api/v1/todos")
                            .param("completed", "false")
                            .param("category", "Work")
                            .param("important", "true")
                            .param("dueDate", "2024-01-15"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));

            verify(todoService, times(1))
                    .findTodos(false, "Work", true, LocalDate.of(2024, 1, 15));
        }
    }

    @Nested
    @DisplayName("GET /api/v1/todos/{id} Tests")
    class GetTodoByIdTests {

        @Test
        @DisplayName("Should return todo when found")
        void shouldReturnTodoWhenFound() throws Exception {
            // Given
            when(todoService.findTodoById(TODO_ID)).thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(get("/api/v1/todos/{id}", TODO_ID))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.title", is("Test Todo")))
                    .andExpect(jsonPath("$.description", is("Test Description")))
                    .andExpect(jsonPath("$.completed", is(false)))
                    .andExpect(jsonPath("$.important", is(false)))
                    .andExpect(jsonPath("$.category", is("Test")))
                    .andExpect(jsonPath("$.dueDate", is("2024-01-15")));

            verify(todoService, times(1)).findTodoById(TODO_ID);
        }

        @Test
        @DisplayName("Should return 404 when todo not found")
        void shouldReturn404WhenTodoNotFound() throws Exception {
            // Given
            when(todoService.findTodoById(anyLong())).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(get("/api/v1/todos/{id}", 999L))
                    .andDo(print())
                    .andExpect(status().isNotFound());

            verify(todoService, times(1)).findTodoById(999L);
        }
    }

    @Nested
    @DisplayName("POST /api/v1/todos Tests")
    class CreateTodoTests {

        @Test
        @DisplayName("Should create todo successfully")
        void shouldCreateTodoSuccessfully() throws Exception {
            // Given
            Todo todoToCreate = new Todo();
            todoToCreate.setTitle("New Todo");
            todoToCreate.setDescription("New Description");
            todoToCreate.setCategory("Work");
            todoToCreate.setImportant(true);
            todoToCreate.setDueDate(LocalDate.of(2024, 1, 20));

            Todo createdTodo = new Todo();
            createdTodo.setId(2L);
            createdTodo.setTitle("New Todo");
            createdTodo.setDescription("New Description");
            createdTodo.setCategory("Work");
            createdTodo.setImportant(true);
            createdTodo.setCompleted(false);
            createdTodo.setDueDate(LocalDate.of(2024, 1, 20));

            when(todoService.createTodo(any(Todo.class))).thenReturn(createdTodo);

            // When & Then
            mockMvc.perform(post("/api/v1/todos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(todoToCreate)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(2)))
                    .andExpect(jsonPath("$.title", is("New Todo")))
                    .andExpect(jsonPath("$.description", is("New Description")))
                    .andExpect(jsonPath("$.category", is("Work")))
                    .andExpect(jsonPath("$.important", is(true)))
                    .andExpect(jsonPath("$.completed", is(false)))
                    .andExpect(jsonPath("$.dueDate", is("2024-01-20")));

            verify(todoService, times(1)).createTodo(any(Todo.class));
        }

        @Test
        @DisplayName("Should return 400 for invalid todo data")
        void shouldReturn400ForInvalidTodoData() throws Exception {
            // Given - Todo without required title
            Todo invalidTodo = new Todo();
            invalidTodo.setDescription("Description without title");

            // When & Then
            mockMvc.perform(post("/api/v1/todos")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidTodo)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(todoService, never()).createTodo(any(Todo.class));
        }
    }

    @Nested
    @DisplayName("PUT /api/v1/todos/{id} Tests")
    class UpdateTodoTests {

        @Test
        @DisplayName("Should update todo successfully")
        void shouldUpdateTodoSuccessfully() throws Exception {
            // Given
            Todo updatedTodo = new Todo();
            updatedTodo.setTitle("Updated Todo");
            updatedTodo.setDescription("Updated Description");
            updatedTodo.setCompleted(true);
            updatedTodo.setImportant(true);
            updatedTodo.setCategory("Updated");

            when(todoService.updateTodo(eq(TODO_ID), any(Todo.class)))
                    .thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(put("/api/v1/todos/{id}", TODO_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updatedTodo)))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)));

            verify(todoService, times(1)).updateTodo(eq(TODO_ID), any(Todo.class));
        }

        @Test
        @DisplayName("Should return 404 when updating non-existent todo")
        void shouldReturn404WhenUpdatingNonExistentTodo() throws Exception {
            // Given
            Todo updatedTodo = new Todo();
            updatedTodo.setTitle("Updated Todo");

            when(todoService.updateTodo(anyLong(), any(Todo.class)))
                    .thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(put("/api/v1/todos/{id}", 999L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updatedTodo)))
                    .andDo(print())
                    .andExpect(status().isNotFound());

            verify(todoService, times(1)).updateTodo(eq(999L), any(Todo.class));
        }
    }

    @Nested
    @DisplayName("DELETE /api/v1/todos/{id} Tests")
    class DeleteTodoTests {

        @Test
        @DisplayName("Should delete todo successfully")
        void shouldDeleteTodoSuccessfully() throws Exception {
            // Given
            when(todoService.deleteTodo(TODO_ID)).thenReturn(true);

            // When & Then
            mockMvc.perform(delete("/api/v1/todos/{id}", TODO_ID))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.message", is("Todo successfully deleted")))
                    .andExpect(jsonPath("$.deletedId", is(1)));

            verify(todoService, times(1)).deleteTodo(TODO_ID);
        }

        @Test
        @DisplayName("Should return 404 when deleting non-existent todo")
        void shouldReturn404WhenDeletingNonExistentTodo() throws Exception {
            // Given
            when(todoService.deleteTodo(anyLong())).thenReturn(false);

            // When & Then
            mockMvc.perform(delete("/api/v1/todos/{id}", 999L))
                    .andDo(print())
                    .andExpect(status().isNotFound());

            verify(todoService, times(1)).deleteTodo(999L);
        }
    }

    @Nested
    @DisplayName("PATCH Partial Update Tests")
    class PartialUpdateTests {

        @Test
        @DisplayName("Should mark todo as completed via PATCH")
        void shouldMarkTodoAsCompleted() throws Exception {
            // Given
            testTodo.setCompleted(true);
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(true);
            when(todoService.patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class))).thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(patch("/api/v1/todos/{id}", TODO_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"completed\": true}"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.completed", is(true)));

            verify(todoService, times(1)).patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class));
        }

        @Test
        @DisplayName("Should mark todo as incomplete via PATCH")
        void shouldMarkTodoAsIncomplete() throws Exception {
            // Given
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setCompleted(false);
            when(todoService.patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class))).thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(patch("/api/v1/todos/{id}", TODO_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"completed\": false}"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.completed", is(false)));

            verify(todoService, times(1)).patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class));
        }

        @Test
        @DisplayName("Should mark todo as important via PATCH")
        void shouldMarkTodoAsImportant() throws Exception {
            // Given
            testTodo.setImportant(true);
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setImportant(true);
            when(todoService.patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class))).thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(patch("/api/v1/todos/{id}", TODO_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"important\": true}"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.important", is(true)));

            verify(todoService, times(1)).patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class));
        }

        @Test
        @DisplayName("Should mark todo as not important via PATCH")
        void shouldMarkTodoAsNotImportant() throws Exception {
            // Given
            TodoUpdateRequest updateRequest = new TodoUpdateRequest();
            updateRequest.setImportant(false);
            when(todoService.patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class))).thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(patch("/api/v1/todos/{id}", TODO_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"important\": false}"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.important", is(false)));

            verify(todoService, times(1)).patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class));
        }

        @Test
        @DisplayName("Should return 404 when patching non-existent todo")
        void shouldReturn404WhenPatchingNonExistentTodo() throws Exception {
            // Given
            when(todoService.patchTodo(eq(999L), any(TodoUpdateRequest.class))).thenReturn(Optional.empty());

            // When & Then
            mockMvc.perform(patch("/api/v1/todos/{id}", 999L)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"completed\": true}"))
                    .andDo(print())
                    .andExpect(status().isNotFound());

            verify(todoService, times(1)).patchTodo(eq(999L), any(TodoUpdateRequest.class));
        }

        @Test
        @DisplayName("Should update multiple fields via PATCH")
        void shouldUpdateMultipleFields() throws Exception {
            // Given
            testTodo.setCompleted(true);
            testTodo.setImportant(true);
            testTodo.setTitle("Updated Title");
            when(todoService.patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class))).thenReturn(Optional.of(testTodo));

            // When & Then
            mockMvc.perform(patch("/api/v1/todos/{id}", TODO_ID)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"completed\": true, \"important\": true, \"title\": \"Updated Title\"}"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(1)))
                    .andExpect(jsonPath("$.completed", is(true)))
                    .andExpect(jsonPath("$.important", is(true)))
                    .andExpect(jsonPath("$.title", is("Updated Title")));

            verify(todoService, times(1)).patchTodo(eq(TODO_ID), any(TodoUpdateRequest.class));
        }
    }

    @Nested
    @DisplayName("Search Tests")
    class SearchTests {

        @Test
        @DisplayName("Should search todos successfully using query parameter")
        void shouldSearchTodosSuccessfully() throws Exception {
            // Given
            List<Todo> searchResults = Collections.singletonList(testTodo);
            when(todoService.searchTodos("test")).thenReturn(searchResults);

            // When & Then
            mockMvc.perform(get("/api/v1/todos")
                            .param("q", "test"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is(1)))
                    .andExpect(jsonPath("$[0].title", containsString("Test")));

            verify(todoService, times(1)).searchTodos("test");
            verify(todoService, never()).findTodos(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Should return empty list when no search results")
        void shouldReturnEmptyListWhenNoSearchResults() throws Exception {
            // Given
            when(todoService.searchTodos("nonexistent")).thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/v1/todos")
                            .param("q", "nonexistent"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(todoService, times(1)).searchTodos("nonexistent");
            verify(todoService, never()).findTodos(any(), any(), any(), any());
        }

        @Test
        @DisplayName("Should use filter when no search query provided")
        void shouldUseFilterWhenNoSearchQuery() throws Exception {
            // Given
            List<Todo> todos = Collections.singletonList(testTodo);
            when(todoService.findTodos(true, null, null, null)).thenReturn(todos);

            // When & Then
            mockMvc.perform(get("/api/v1/todos")
                            .param("completed", "true"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)));

            verify(todoService, times(1)).findTodos(true, null, null, null);
            verify(todoService, never()).searchTodos(any());
        }
    }

    @Nested
    @DisplayName("Today's Todos Tests")
    class TodaysTodosTests {

        @Test
        @DisplayName("Should return today's todos")
        void shouldReturnTodaysTodos() throws Exception {
            // Given
            List<Todo> todaysTodos = Collections.singletonList(testTodo);
            when(todoService.findTodaysTodos()).thenReturn(todaysTodos);

            // When & Then
            mockMvc.perform(get("/api/v1/todos/today"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id", is(1)));

            verify(todoService, times(1)).findTodaysTodos();
        }

        @Test
        @DisplayName("Should return today's todos filtered by completion status")
        void shouldReturnTodaysTodosFilteredByCompletionStatus() throws Exception {
            // Given
            List<Todo> todaysTodos = Collections.singletonList(testTodo);
            when(todoService.findTodaysTodos(false)).thenReturn(todaysTodos);

            // When & Then
            mockMvc.perform(get("/api/v1/todos/today")
                            .param("completed", "false"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].completed", is(false)));

            verify(todoService, times(1)).findTodaysTodos(false);
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
        anotherTodo.setDueDate(LocalDate.of(2024, 1, 16));
        return anotherTodo;
    }
}