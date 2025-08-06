package me.coding.repository;

import me.coding.model.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import jakarta.validation.ConstraintViolationException;

import java.util.List;
import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@DisplayName("CategoryRepository Tests")
class CategoryRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category workCategory;
    private Category personalCategory;
    private Category healthCategory;

    @BeforeEach
    void setUp() {
        workCategory = new Category();
        workCategory.setName("Work");
        workCategory.setDescription("Work related tasks and projects");

        personalCategory = new Category();
        personalCategory.setName("Personal");
        personalCategory.setDescription("Personal tasks and activities");

        healthCategory = new Category();
        healthCategory.setName("Health");
        healthCategory.setDescription("Health and fitness related tasks");

        // Persist test data
        entityManager.persistAndFlush(workCategory);
        entityManager.persistAndFlush(personalCategory);
        entityManager.persistAndFlush(healthCategory);
    }

    @Nested
    @DisplayName("Basic CRUD Operations")
    class BasicCrudOperations {

        @Test
        @DisplayName("Should save and find category by id")
        void shouldSaveAndFindCategoryById() {
            // Given
            Category newCategory = new Category();
            newCategory.setName("Shopping");
            newCategory.setDescription("Shopping related tasks");

            // When
            Category savedCategory = categoryRepository.save(newCategory);
            Category foundCategory = categoryRepository.findById(savedCategory.getId()).orElse(null);

            // Then
            assertThat(foundCategory, is(notNullValue()));
            assertThat(foundCategory.getName(), is(equalTo("Shopping")));
            assertThat(foundCategory.getDescription(), is(equalTo("Shopping related tasks")));
            assertThat(foundCategory.getCreatedAt(), is(notNullValue()));
        }

        @Test
        @DisplayName("Should find all categories")
        void shouldFindAllCategories() {
            // When
            List<Category> categories = categoryRepository.findAll();

            // Then
            assertThat(categories, hasSize(3));
            assertThat(categories, hasItems(workCategory, personalCategory, healthCategory));
        }

        @Test
        @DisplayName("Should save category with minimal data")
        void shouldSaveCategoryWithMinimalData() {
            // Given
            Category minimalCategory = new Category();
            minimalCategory.setName("Minimal");

            // When
            Category savedCategory = categoryRepository.save(minimalCategory);

            // Then
            assertThat(savedCategory.getId(), is(notNullValue()));
            assertThat(savedCategory.getName(), is(equalTo("Minimal")));
            assertThat(savedCategory.getDescription(), is(nullValue()));
            assertThat(savedCategory.getCreatedAt(), is(notNullValue()));
        }

        @Test
        @DisplayName("Should delete category")
        void shouldDeleteCategory() {
            // Given
            Long categoryId = workCategory.getId();

            // When
            categoryRepository.delete(workCategory);
            entityManager.flush();

            // Then
            Optional<Category> deletedCategory = categoryRepository.findById(categoryId);
            assertThat(deletedCategory.isEmpty(), is(true));

            List<Category> remainingCategories = categoryRepository.findAll();
            assertThat(remainingCategories, hasSize(2));
            assertThat(remainingCategories, not(hasItem(workCategory)));
        }
    }

    @Nested
    @DisplayName("Find By Name Tests")
    class FindByNameTests {

        @Test
        @DisplayName("Should find category by exact name")
        void shouldFindCategoryByExactName() {
            // When
            Optional<Category> foundCategory = categoryRepository.findByName("Work");

            // Then
            assertThat(foundCategory.isPresent(), is(true));
            assertThat(foundCategory.get(), is(equalTo(workCategory)));
            assertThat(foundCategory.get().getName(), is(equalTo("Work")));
            assertThat(foundCategory.get().getDescription(), is(equalTo("Work related tasks and projects")));
        }

        @Test
        @DisplayName("Should return empty when category name not found")
        void shouldReturnEmptyWhenCategoryNameNotFound() {
            // When
            Optional<Category> foundCategory = categoryRepository.findByName("NonExistent");

            // Then
            assertThat(foundCategory.isEmpty(), is(true));
        }

        @Test
        @DisplayName("Should find category with case sensitive search")
        void shouldFindCategoryWithCaseSensitiveSearch() {
            // When
            Optional<Category> exactMatch = categoryRepository.findByName("Work");
            Optional<Category> lowerCaseMatch = categoryRepository.findByName("work");
            Optional<Category> upperCaseMatch = categoryRepository.findByName("WORK");

            // Then
            assertThat(exactMatch.isPresent(), is(true));
            assertThat(lowerCaseMatch.isEmpty(), is(true));  // Case sensitive
            assertThat(upperCaseMatch.isEmpty(), is(true));  // Case sensitive
        }

        @Test
        @DisplayName("Should return empty for null name")
        void shouldReturnEmptyForNullName() {
            // When
            Optional<Category> foundCategory = categoryRepository.findByName(null);

            // Then
            assertThat(foundCategory.isEmpty(), is(true));
        }

        @Test
        @DisplayName("Should return empty for empty name")
        void shouldReturnEmptyForEmptyName() {
            // When
            Optional<Category> foundCategory = categoryRepository.findByName("");

            // Then
            assertThat(foundCategory.isEmpty(), is(true));
        }
    }

    @Nested
    @DisplayName("Exists By Name Tests")
    class ExistsByNameTests {

        @Test
        @DisplayName("Should return true when category exists")
        void shouldReturnTrueWhenCategoryExists() {
            // When
            boolean exists = categoryRepository.existsByName("Work");

            // Then
            assertThat(exists, is(true));
        }

        @Test
        @DisplayName("Should return false when category does not exist")
        void shouldReturnFalseWhenCategoryDoesNotExist() {
            // When
            boolean exists = categoryRepository.existsByName("NonExistent");

            // Then
            assertThat(exists, is(false));
        }

        @Test
        @DisplayName("Should be case sensitive")
        void shouldBeCaseSensitive() {
            // When
            boolean exactMatch = categoryRepository.existsByName("Work");
            boolean lowerCaseMatch = categoryRepository.existsByName("work");
            boolean upperCaseMatch = categoryRepository.existsByName("WORK");

            // Then
            assertThat(exactMatch, is(true));
            assertThat(lowerCaseMatch, is(false));  // Case sensitive
            assertThat(upperCaseMatch, is(false));  // Case sensitive
        }

        @Test
        @DisplayName("Should return false for null name")
        void shouldReturnFalseForNullName() {
            // When
            boolean exists = categoryRepository.existsByName(null);

            // Then
            assertThat(exists, is(false));
        }

        @Test
        @DisplayName("Should return false for empty name")
        void shouldReturnFalseForEmptyName() {
            // When
            boolean exists = categoryRepository.existsByName("");

            // Then
            assertThat(exists, is(false));
        }
    }

    @Nested
    @DisplayName("Constraint Tests")
    class ConstraintTests {

        @Test
        @DisplayName("Should enforce unique name constraint")
        void shouldEnforceUniqueNameConstraint() {
            // Given
            Category duplicateCategory = new Category();
            duplicateCategory.setName("Work");  // Same name as existing category
            duplicateCategory.setDescription("Duplicate work category");

            // When & Then
            assertThrows(DataIntegrityViolationException.class, () -> {
                categoryRepository.save(duplicateCategory);
                entityManager.flush();  // Force the constraint check
            });
        }

        @Test
        @DisplayName("Should allow different names")
        void shouldAllowDifferentNames() {
            // Given
            Category uniqueCategory = new Category();
            uniqueCategory.setName("Entertainment");
            uniqueCategory.setDescription("Entertainment related tasks");

            // When
            Category savedCategory = categoryRepository.save(uniqueCategory);
            entityManager.flush();

            // Then
            assertThat(savedCategory.getId(), is(notNullValue()));
            assertThat(savedCategory.getName(), is(equalTo("Entertainment")));
        }

        @Test
        @DisplayName("Should enforce name length constraint")
        void shouldEnforceNameLengthConstraint() {
            // Given - Name longer than 50 characters
            Category longNameCategory = new Category();
            longNameCategory.setName("This is a very long category name that exceeds fifty characters limit");
            longNameCategory.setDescription("Valid description");

            // When & Then
            assertThrows(ConstraintViolationException.class, () -> {
                categoryRepository.save(longNameCategory);
                entityManager.flush();
            });
        }

        @Test
        @DisplayName("Should enforce description length constraint")
        void shouldEnforceDescriptionLengthConstraint() {
            // Given - Description longer than 200 characters
            Category longDescCategory = new Category();
            longDescCategory.setName("ValidName");
            longDescCategory.setDescription("This is a very long description that exceeds the maximum allowed length of 200 characters. " +
                    "It contains way too much text and should trigger a constraint violation when trying to save this category to the database.");

            // When & Then
            assertThrows(ConstraintViolationException.class, () -> {
                categoryRepository.save(longDescCategory);
                entityManager.flush();
            });
        }

        @Test
        @DisplayName("Should allow maximum length name")
        void shouldAllowMaximumLengthName() {
            // Given - Name exactly 50 characters
            String maxLengthName = "12345678901234567890123456789012345678901234567890"; // 50 chars
            Category maxNameCategory = new Category();
            maxNameCategory.setName(maxLengthName);
            maxNameCategory.setDescription("Valid description");

            // When
            Category savedCategory = categoryRepository.save(maxNameCategory);
            entityManager.flush();

            // Then
            assertThat(savedCategory.getId(), is(notNullValue()));
            assertThat(savedCategory.getName(), is(equalTo(maxLengthName)));
            assertThat(savedCategory.getName().length(), is(equalTo(50)));
        }

        @Test
        @DisplayName("Should allow maximum length description")
        void shouldAllowMaximumLengthDescription() {
            // Given - Description exactly 200 characters
            String maxLengthDesc = "a".repeat(200); // 200 chars
            Category maxDescCategory = new Category();
            maxDescCategory.setName("ValidName");
            maxDescCategory.setDescription(maxLengthDesc);

            // When
            Category savedCategory = categoryRepository.save(maxDescCategory);
            entityManager.flush();

            // Then
            assertThat(savedCategory.getId(), is(notNullValue()));
            assertThat(savedCategory.getDescription(), is(equalTo(maxLengthDesc)));
            assertThat(savedCategory.getDescription().length(), is(equalTo(200)));
        }
    }

    @Nested
    @DisplayName("JPA Lifecycle Tests")
    class JpaLifecycleTests {

        @Test
        @DisplayName("Should set createdAt timestamp on persist")
        void shouldSetCreatedAtTimestampOnPersist() {
            // Given
            Category newCategory = new Category();
            newCategory.setName("TimestampTest");
            newCategory.setDescription("Test timestamp creation");

            // When
            Category savedCategory = categoryRepository.save(newCategory);

            // Then
            assertThat(savedCategory.getCreatedAt(), is(notNullValue()));
        }

        @Test
        @DisplayName("Should not update createdAt on subsequent saves")
        void shouldNotUpdateCreatedAtOnSubsequentSaves() {
            // Given
            Category category = categoryRepository.findByName("Work").orElseThrow();
            var originalCreatedAt = category.getCreatedAt();

            // When
            category.setDescription("Updated description");
            Category updatedCategory = categoryRepository.save(category);
            entityManager.flush();

            // Then
            assertThat(updatedCategory.getCreatedAt(), is(equalTo(originalCreatedAt)));
            assertThat(updatedCategory.getDescription(), is(equalTo("Updated description")));
        }
    }

    @Nested
    @DisplayName("Query Performance Tests")
    class QueryPerformanceTests {

        @Test
        @DisplayName("Should efficiently find by name with index")
        void shouldEfficientlyFindByNameWithIndex() {
            // Given - Create many categories to test index performance
            for (int i = 0; i < 100; i++) {
                Category category = new Category();
                category.setName("Category" + i);
                category.setDescription("Description " + i);
                entityManager.persist(category);
            }
            entityManager.flush();

            // When
            long startTime = System.currentTimeMillis();
            Optional<Category> foundCategory = categoryRepository.findByName("Category50");
            long endTime = System.currentTimeMillis();

            // Then
            assertThat(foundCategory.isPresent(), is(true));
            assertThat(foundCategory.get().getName(), is(equalTo("Category50")));
            // Performance check - should be very fast with proper indexing
            assertThat(endTime - startTime, is(lessThan(100L))); // Less than 100ms
        }

        @Test
        @DisplayName("Should efficiently check existence by name")
        void shouldEfficientlyCheckExistenceByName() {
            // When
            long startTime = System.currentTimeMillis();
            boolean exists = categoryRepository.existsByName("Work");
            long endTime = System.currentTimeMillis();

            // Then
            assertThat(exists, is(true));
            // Performance check - should be very fast
            assertThat(endTime - startTime, is(lessThan(50L))); // Less than 50ms
        }
    }
}