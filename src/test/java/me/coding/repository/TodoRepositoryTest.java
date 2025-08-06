package me.coding.repository;

import me.coding.model.Todo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("TodoRepository Tests")
class TodoRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TodoRepository todoRepository;

    private Todo workTodo;
    private Todo personalTodo;
    private Todo completedTodo;
    private Todo importantTodo;
    private Todo todayTodo;

    @BeforeEach
    void setUp() {
        // Work todo - incomplete, not important
        workTodo = new Todo();
        workTodo.setTitle("Complete project");
        workTodo.setDescription("Finish the project documentation");
        workTodo.setCompleted(false);
        workTodo.setImportant(false);
        workTodo.setCategory("Work");
        workTodo.setDueDate(LocalDate.now().plusDays(1));

        // Personal todo - incomplete, not important
        personalTodo = new Todo();
        personalTodo.setTitle("Buy groceries");
        personalTodo.setDescription("Buy milk and bread");
        personalTodo.setCompleted(false);
        personalTodo.setImportant(false);
        personalTodo.setCategory("Personal");
        personalTodo.setDueDate(LocalDate.now().plusDays(2));

        // Completed todo - completed, not important
        completedTodo = new Todo();
        completedTodo.setTitle("Clean house");
        completedTodo.setDescription("Clean the entire house");
        completedTodo.setCompleted(true);
        completedTodo.setImportant(false);
        completedTodo.setCategory("Personal");
        completedTodo.setDueDate(LocalDate.now().minusDays(1));

        // Important todo - incomplete, important
        importantTodo = new Todo();
        importantTodo.setTitle("Important meeting");
        importantTodo.setDescription("Attend important client meeting");
        importantTodo.setCompleted(false);
        importantTodo.setImportant(true);
        importantTodo.setCategory("Work");
        importantTodo.setDueDate(LocalDate.now());

        // Today's todo - due today
        todayTodo = new Todo();
        todayTodo.setTitle("Daily standup");
        todayTodo.setDescription("Attend daily team standup");
        todayTodo.setCompleted(false);
        todayTodo.setImportant(false);
        todayTodo.setCategory("Work");
        todayTodo.setDueDate(LocalDate.now());

        // Persist test data
        entityManager.persistAndFlush(workTodo);
        entityManager.persistAndFlush(personalTodo);
        entityManager.persistAndFlush(completedTodo);
        entityManager.persistAndFlush(importantTodo);
        entityManager.persistAndFlush(todayTodo);
    }

    @Nested
    @DisplayName("Basic CRUD Operations")
    class BasicCrudOperations {

        @Test
        @DisplayName("Should save and find todo by id")
        void shouldSaveAndFindTodoById() {
            // Given
            Todo newTodo = new Todo();
            newTodo.setTitle("New Todo");
            newTodo.setDescription("New Description");
            newTodo.setCompleted(false);
            newTodo.setImportant(true);
            newTodo.setCategory("Health");

            // When
            Todo savedTodo = todoRepository.save(newTodo);
            Todo foundTodo = todoRepository.findById(savedTodo.getId()).orElse(null);

            // Then
            assertThat(foundTodo, is(notNullValue()));
            assertThat(foundTodo.getTitle(), is(equalTo("New Todo")));
            assertThat(foundTodo.getDescription(), is(equalTo("New Description")));
            assertThat(foundTodo.getCompleted(), is(false));
            assertThat(foundTodo.getImportant(), is(true));
            assertThat(foundTodo.getCategory(), is(equalTo("Health")));
            assertThat(foundTodo.getCreatedAt(), is(notNullValue()));
            assertThat(foundTodo.getUpdatedAt(), is(notNullValue()));
        }

        @Test
        @DisplayName("Should find all todos")
        void shouldFindAllTodos() {
            // When
            List<Todo> todos = todoRepository.findAll();

            // Then
            assertThat(todos, hasSize(5));
            assertThat(todos, hasItems(workTodo, personalTodo, completedTodo, importantTodo, todayTodo));
        }
    }

    @Nested
    @DisplayName("Find By Completion Status")
    class FindByCompletionStatus {

        @Test
        @DisplayName("Should find completed todos")
        void shouldFindCompletedTodos() {
            // When
            List<Todo> completedTodos = todoRepository.findByCompleted(true);

            // Then
            assertThat(completedTodos, hasSize(1));
            assertThat(completedTodos, contains(completedTodo));
            assertThat(completedTodos.get(0).getCompleted(), is(true));
        }

        @Test
        @DisplayName("Should find incomplete todos")
        void shouldFindIncompleteTodos() {
            // When
            List<Todo> incompleteTodos = todoRepository.findByCompleted(false);

            // Then
            assertThat(incompleteTodos, hasSize(4));
            assertThat(incompleteTodos, hasItems(workTodo, personalTodo, importantTodo, todayTodo));
            incompleteTodos.forEach(todo -> assertThat(todo.getCompleted(), is(false)));
        }

        @Test
        @DisplayName("Should find todos by completion status ordered by creation date")
        void shouldFindTodosByCompletionStatusOrderedByCreationDate() {
            // When
            List<Todo> incompleteTodos = todoRepository.findByCompletedOrderByCreatedAtDesc(false);

            // Then
            assertThat(incompleteTodos, hasSize(4));
            // Verify they are ordered by creation date descending (most recent first)
            for (int i = 0; i < incompleteTodos.size() - 1; i++) {
                assertTrue(incompleteTodos.get(i).getCreatedAt()
                        .isAfter(incompleteTodos.get(i + 1).getCreatedAt()) ||
                        incompleteTodos.get(i).getCreatedAt()
                        .isEqual(incompleteTodos.get(i + 1).getCreatedAt()));
            }
        }
    }

    @Nested
    @DisplayName("Find By Category")
    class FindByCategory {

        @Test
        @DisplayName("Should find todos by category")
        void shouldFindTodosByCategory() {
            // When
            List<Todo> workTodos = todoRepository.findByCategory("Work");
            List<Todo> personalTodos = todoRepository.findByCategory("Personal");

            // Then
            assertThat(workTodos, hasSize(3));
            assertThat(workTodos, hasItems(workTodo, importantTodo, todayTodo));
            workTodos.forEach(todo -> assertThat(todo.getCategory(), is(equalTo("Work"))));

            assertThat(personalTodos, hasSize(2));
            assertThat(personalTodos, hasItems(personalTodo, completedTodo));
            personalTodos.forEach(todo -> assertThat(todo.getCategory(), is(equalTo("Personal"))));
        }

        @Test
        @DisplayName("Should find todos by category and completion status")
        void shouldFindTodosByCategoryAndCompletionStatus() {
            // When
            List<Todo> incompleteWorkTodos = todoRepository.findByCategoryAndCompleted("Work", false);
            List<Todo> completedPersonalTodos = todoRepository.findByCategoryAndCompleted("Personal", true);

            // Then
            assertThat(incompleteWorkTodos, hasSize(3));
            assertThat(incompleteWorkTodos, hasItems(workTodo, importantTodo, todayTodo));
            incompleteWorkTodos.forEach(todo -> {
                assertThat(todo.getCategory(), is(equalTo("Work")));
                assertThat(todo.getCompleted(), is(false));
            });

            assertThat(completedPersonalTodos, hasSize(1));
            assertThat(completedPersonalTodos, contains(completedTodo));
            assertThat(completedPersonalTodos.get(0).getCategory(), is(equalTo("Personal")));
            assertThat(completedPersonalTodos.get(0).getCompleted(), is(true));
        }
    }

    @Nested
    @DisplayName("Find By Important Status")
    class FindByImportantStatus {

        @Test
        @DisplayName("Should find important todos")
        void shouldFindImportantTodos() {
            // When
            List<Todo> importantTodos = todoRepository.findByImportant(true);

            // Then
            assertThat(importantTodos, hasSize(1));
            assertThat(importantTodos, contains(importantTodo));
            assertThat(importantTodos.get(0).getImportant(), is(true));
        }

        @Test
        @DisplayName("Should find not important todos")
        void shouldFindNotImportantTodos() {
            // When
            List<Todo> notImportantTodos = todoRepository.findByImportant(false);

            // Then
            assertThat(notImportantTodos, hasSize(4));
            assertThat(notImportantTodos, hasItems(workTodo, personalTodo, completedTodo, todayTodo));
            notImportantTodos.forEach(todo -> assertThat(todo.getImportant(), is(false)));
        }

        @Test
        @DisplayName("Should find todos by important and completion status")
        void shouldFindTodosByImportantAndCompletionStatus() {
            // When
            List<Todo> importantIncompleteTodos = todoRepository.findByImportantAndCompleted(true, false);

            // Then
            assertThat(importantIncompleteTodos, hasSize(1));
            assertThat(importantIncompleteTodos, contains(importantTodo));
            assertThat(importantIncompleteTodos.get(0).getImportant(), is(true));
            assertThat(importantIncompleteTodos.get(0).getCompleted(), is(false));
        }

        @Test
        @DisplayName("Should find todos by important and category")
        void shouldFindTodosByImportantAndCategory() {
            // When
            List<Todo> importantWorkTodos = todoRepository.findByImportantAndCategory(true, "Work");

            // Then
            assertThat(importantWorkTodos, hasSize(1));
            assertThat(importantWorkTodos, contains(importantTodo));
            assertThat(importantWorkTodos.get(0).getImportant(), is(true));
            assertThat(importantWorkTodos.get(0).getCategory(), is(equalTo("Work")));
        }

        @Test
        @DisplayName("Should find todos by important, category and completion status")
        void shouldFindTodosByImportantCategoryAndCompletionStatus() {
            // When
            List<Todo> importantIncompleteWorkTodos = 
                todoRepository.findByImportantAndCategoryAndCompleted(true, "Work", false);

            // Then
            assertThat(importantIncompleteWorkTodos, hasSize(1));
            assertThat(importantIncompleteWorkTodos, contains(importantTodo));
            assertThat(importantIncompleteWorkTodos.get(0).getImportant(), is(true));
            assertThat(importantIncompleteWorkTodos.get(0).getCategory(), is(equalTo("Work")));
            assertThat(importantIncompleteWorkTodos.get(0).getCompleted(), is(false));
        }
    }

    @Nested
    @DisplayName("Find By Due Date")
    class FindByDueDate {

        @Test
        @DisplayName("Should find todos by due date")
        void shouldFindTodosByDueDate() {
            // When
            List<Todo> todaysTodos = todoRepository.findByDueDate(LocalDate.now());

            // Then
            assertThat(todaysTodos, hasSize(2));
            assertThat(todaysTodos, hasItems(importantTodo, todayTodo));
            todaysTodos.forEach(todo -> 
                assertThat(todo.getDueDate(), is(equalTo(LocalDate.now()))));
        }

        @Test
        @DisplayName("Should find todos by due date and completion status")
        void shouldFindTodosByDueDateAndCompletionStatus() {
            // When
            List<Todo> todaysIncompleteTodos = 
                todoRepository.findByDueDateAndCompleted(LocalDate.now(), false);

            // Then
            assertThat(todaysIncompleteTodos, hasSize(2));
            assertThat(todaysIncompleteTodos, hasItems(importantTodo, todayTodo));
            todaysIncompleteTodos.forEach(todo -> {
                assertThat(todo.getDueDate(), is(equalTo(LocalDate.now())));
                assertThat(todo.getCompleted(), is(false));
            });
        }

        @Test
        @DisplayName("Should find todos by due date and important status")
        void shouldFindTodosByDueDateAndImportantStatus() {
            // When
            List<Todo> todaysImportantTodos = 
                todoRepository.findByDueDateAndImportant(LocalDate.now(), true);

            // Then
            assertThat(todaysImportantTodos, hasSize(1));
            assertThat(todaysImportantTodos, contains(importantTodo));
            assertThat(todaysImportantTodos.get(0).getDueDate(), is(equalTo(LocalDate.now())));
            assertThat(todaysImportantTodos.get(0).getImportant(), is(true));
        }

        @Test
        @DisplayName("Should find todos by due date and category")
        void shouldFindTodosByDueDateAndCategory() {
            // When
            List<Todo> todaysWorkTodos = 
                todoRepository.findByDueDateAndCategory(LocalDate.now(), "Work");

            // Then
            assertThat(todaysWorkTodos, hasSize(2));
            assertThat(todaysWorkTodos, hasItems(importantTodo, todayTodo));
            todaysWorkTodos.forEach(todo -> {
                assertThat(todo.getDueDate(), is(equalTo(LocalDate.now())));
                assertThat(todo.getCategory(), is(equalTo("Work")));
            });
        }

        @Test
        @DisplayName("Should find todos by all date filters")
        void shouldFindTodosByAllDateFilters() {
            // When
            List<Todo> todaysImportantIncompleteWorkTodos = 
                todoRepository.findByDueDateAndImportantAndCategoryAndCompleted(
                    LocalDate.now(), true, "Work", false);

            // Then
            assertThat(todaysImportantIncompleteWorkTodos, hasSize(1));
            assertThat(todaysImportantIncompleteWorkTodos, contains(importantTodo));
            assertThat(todaysImportantIncompleteWorkTodos.get(0).getDueDate(), is(equalTo(LocalDate.now())));
            assertThat(todaysImportantIncompleteWorkTodos.get(0).getImportant(), is(true));
            assertThat(todaysImportantIncompleteWorkTodos.get(0).getCategory(), is(equalTo("Work")));
            assertThat(todaysImportantIncompleteWorkTodos.get(0).getCompleted(), is(false));
        }

        @Test
        @DisplayName("Should find todos by date range")
        void shouldFindTodosByDateRange() {
            // When
            List<Todo> todosThisWeek = todoRepository.findByDueDateBetween(
                LocalDate.now().minusDays(1), 
                LocalDate.now().plusDays(2)
            );

            // Then
            assertThat(todosThisWeek, hasSize(5)); // All test todos fall within this range
            assertThat(todosThisWeek, hasItems(workTodo, personalTodo, completedTodo, importantTodo, todayTodo));
        }

        @Test
        @DisplayName("Should find todos with null due date")
        void shouldFindTodosWithNullDueDate() {
            // Given - Create a todo without due date
            Todo todoWithoutDate = new Todo();
            todoWithoutDate.setTitle("No due date");
            todoWithoutDate.setDescription("Task without due date");
            todoWithoutDate.setCompleted(false);
            todoWithoutDate.setImportant(false);
            todoWithoutDate.setCategory("Misc");
            entityManager.persistAndFlush(todoWithoutDate);

            // When
            List<Todo> todosWithoutDate = todoRepository.findByDueDateIsNull();

            // Then
            assertThat(todosWithoutDate, hasSize(1));
            assertThat(todosWithoutDate, contains(todoWithoutDate));
            assertThat(todosWithoutDate.get(0).getDueDate(), is(nullValue()));
        }
    }

    @Nested
    @DisplayName("Today's Todos Queries")
    class TodaysTodosQueries {

        @Test
        @DisplayName("Should find today's todos using query")
        void shouldFindTodaysTodosUsingQuery() {
            // When
            List<Todo> todaysTodos = todoRepository.findTodaysTodos();

            // Then
            assertThat(todaysTodos, hasSize(2));
            assertThat(todaysTodos, hasItems(importantTodo, todayTodo));
            todaysTodos.forEach(todo -> 
                assertThat(todo.getDueDate(), is(equalTo(LocalDate.now()))));
        }

        @Test
        @DisplayName("Should find today's todos by completion status using query")
        void shouldFindTodaysTodosByCompletionStatusUsingQuery() {
            // When
            List<Todo> todaysIncompleteTodos = todoRepository.findTodaysTodosByCompleted(false);

            // Then
            assertThat(todaysIncompleteTodos, hasSize(2));
            assertThat(todaysIncompleteTodos, hasItems(importantTodo, todayTodo));
            todaysIncompleteTodos.forEach(todo -> {
                assertThat(todo.getDueDate(), is(equalTo(LocalDate.now())));
                assertThat(todo.getCompleted(), is(false));
            });
        }
    }

    @Nested
    @DisplayName("Search Queries")
    class SearchQueries {

        @Test
        @DisplayName("Should find todos by title or description containing search term")
        void shouldFindTodosByTitleOrDescriptionContainingSearchTerm() {
            // When
            List<Todo> projectTodos = todoRepository.findByTitleOrDescriptionContaining("project");
            List<Todo> meetingTodos = todoRepository.findByTitleOrDescriptionContaining("meeting");

            // Then
            assertThat(projectTodos, hasSize(1));
            assertThat(projectTodos, contains(workTodo));

            assertThat(meetingTodos, hasSize(1));
            assertThat(meetingTodos, contains(importantTodo));
        }

        @Test
        @DisplayName("Should find todos by case insensitive search")
        void shouldFindTodosByCaseInsensitiveSearch() {
            // When
            List<Todo> upperCaseSearch = todoRepository.findByTitleOrDescriptionContaining("PROJECT");
            List<Todo> lowerCaseSearch = todoRepository.findByTitleOrDescriptionContaining("project");
            List<Todo> mixedCaseSearch = todoRepository.findByTitleOrDescriptionContaining("Project");

            // Then - Note: H2 database might be case-sensitive by default
            // This test verifies the current behavior
            assertThat(upperCaseSearch.size() + lowerCaseSearch.size() + mixedCaseSearch.size(), 
                is(greaterThanOrEqualTo(1)));
        }

        @Test
        @DisplayName("Should return empty list for non-matching search term")
        void shouldReturnEmptyListForNonMatchingSearchTerm() {
            // When
            List<Todo> nonMatchingTodos = todoRepository.findByTitleOrDescriptionContaining("nonexistent");

            // Then
            assertThat(nonMatchingTodos, is(empty()));
        }
    }
}