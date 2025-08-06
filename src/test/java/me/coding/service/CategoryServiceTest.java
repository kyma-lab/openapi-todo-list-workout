package me.coding.service;

import me.coding.model.Category;
import me.coding.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;
    private final Long CATEGORY_ID = 1L;
    private final String CATEGORY_NAME = "Work";

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(CATEGORY_ID);
        testCategory.setName(CATEGORY_NAME);
        testCategory.setDescription("Work related tasks");
        testCategory.setCreatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("Get Categories Tests")
    class GetCategoriesTests {

        @Test
        @DisplayName("Should return all categories")
        void shouldReturnAllCategories() {
            // Given
            List<Category> expectedCategories = Arrays.asList(testCategory, createAnotherCategory());
            when(categoryRepository.findAll()).thenReturn(expectedCategories);

            // When
            List<Category> result = categoryService.findAllCategories();

            // Then
            assertThat(result, hasSize(2));
            assertThat(result, containsInAnyOrder(testCategory, expectedCategories.get(1)));
            
            verify(categoryRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void shouldReturnEmptyListWhenNoCategoriesExist() {
            // Given
            when(categoryRepository.findAll()).thenReturn(Collections.emptyList());

            // When
            List<Category> result = categoryService.findAllCategories();

            // Then
            assertThat(result, is(empty()));
            
            verify(categoryRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return category by id when exists")
        void shouldReturnCategoryByIdWhenExists() {
            // Given
            when(categoryRepository.findById(CATEGORY_ID)).thenReturn(Optional.of(testCategory));

            // When
            Optional<Category> result = categoryService.findCategoryById(CATEGORY_ID);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(result.get(), is(equalTo(testCategory)));
            assertThat(result.get().getName(), is(equalTo(CATEGORY_NAME)));
            
            verify(categoryRepository, times(1)).findById(CATEGORY_ID);
        }

        @Test
        @DisplayName("Should return empty when category not found by id")
        void shouldReturnEmptyWhenCategoryNotFoundById() {
            // Given
            when(categoryRepository.findById(anyLong())).thenReturn(Optional.empty());

            // When
            Optional<Category> result = categoryService.findCategoryById(999L);

            // Then
            assertThat(result.isEmpty(), is(true));
            
            verify(categoryRepository, times(1)).findById(999L);
        }

        @Test
        @DisplayName("Should return empty when id is null")
        void shouldReturnEmptyWhenIdIsNull() {
            // When
            Optional<Category> result = categoryService.findCategoryById(null);

            // Then
            assertThat(result.isEmpty(), is(true));
            
            verify(categoryRepository, never()).findById(any());
        }

        @Test
        @DisplayName("Should return category by name when exists")
        void shouldReturnCategoryByNameWhenExists() {
            // Given
            when(categoryRepository.findByName(CATEGORY_NAME)).thenReturn(Optional.of(testCategory));

            // When
            Optional<Category> result = categoryService.findCategoryByName(CATEGORY_NAME);

            // Then
            assertThat(result.isPresent(), is(true));
            assertThat(result.get(), is(equalTo(testCategory)));
            assertThat(result.get().getName(), is(equalTo(CATEGORY_NAME)));
            
            verify(categoryRepository, times(1)).findByName(CATEGORY_NAME);
        }

        @Test
        @DisplayName("Should return empty when category not found by name")
        void shouldReturnEmptyWhenCategoryNotFoundByName() {
            // Given
            when(categoryRepository.findByName("NonExistent")).thenReturn(Optional.empty());

            // When
            Optional<Category> result = categoryService.findCategoryByName("NonExistent");

            // Then
            assertThat(result.isEmpty(), is(true));
            
            verify(categoryRepository, times(1)).findByName("NonExistent");
        }

        @Test
        @DisplayName("Should return empty when name is null or empty")
        void shouldReturnEmptyWhenNameIsNullOrEmpty() {
            // When & Then
            Optional<Category> nullResult = categoryService.findCategoryByName(null);
            Optional<Category> emptyResult = categoryService.findCategoryByName("");
            Optional<Category> blankResult = categoryService.findCategoryByName("   ");

            assertThat(nullResult.isEmpty(), is(true));
            assertThat(emptyResult.isEmpty(), is(true));
            assertThat(blankResult.isEmpty(), is(true));
            
            verify(categoryRepository, never()).findByName(any());
        }
    }

    @Nested
    @DisplayName("Create Category Tests")
    class CreateCategoryTests {

        @Test
        @DisplayName("Should create category successfully")
        void shouldCreateCategorySuccessfully() {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("Personal");
            categoryToCreate.setDescription("Personal tasks");

            Category savedCategory = new Category();
            savedCategory.setId(2L);
            savedCategory.setName("Personal");
            savedCategory.setDescription("Personal tasks");

            when(categoryRepository.existsByName("Personal")).thenReturn(false);
            when(categoryRepository.save(any(Category.class))).thenReturn(savedCategory);

            // When
            Category result = categoryService.createCategory(categoryToCreate);

            // Then
            assertThat(result, is(notNullValue()));
            assertThat(result.getId(), is(equalTo(2L)));
            assertThat(result.getName(), is(equalTo("Personal")));
            assertThat(result.getDescription(), is(equalTo("Personal tasks")));
            
            verify(categoryRepository, times(1)).existsByName("Personal");
            verify(categoryRepository, times(1)).save(categoryToCreate);
        }

        @Test
        @DisplayName("Should trim category name before creating")
        void shouldTrimCategoryNameBeforeCreating() {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("  Personal  ");
            categoryToCreate.setDescription("Personal tasks");

            when(categoryRepository.existsByName("Personal")).thenReturn(false);
            when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

            // When
             categoryService.createCategory(categoryToCreate);

            // Then
            assertThat(categoryToCreate.getName(), is(equalTo("Personal")));
            
            verify(categoryRepository, times(1)).existsByName("Personal");
            verify(categoryRepository, times(1)).save(categoryToCreate);
        }

        @Test
        @DisplayName("Should throw exception when category is null")
        void shouldThrowExceptionWhenCategoryIsNull() {
            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.createCategory(null)
            );

            assertThat(exception.getMessage(), is(equalTo("Category cannot be null")));
            
            verify(categoryRepository, never()).existsByName(any());
            verify(categoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when name is null or empty")
        void shouldThrowExceptionWhenNameIsNullOrEmpty() {
            // Given
            Category categoryWithNullName = new Category();
            categoryWithNullName.setName(null);
            
            Category categoryWithEmptyName = new Category();
            categoryWithEmptyName.setName("");
            
            Category categoryWithBlankName = new Category();
            categoryWithBlankName.setName("   ");

            // When & Then
            IllegalArgumentException nullException = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.createCategory(categoryWithNullName)
            );

            IllegalArgumentException emptyException = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.createCategory(categoryWithEmptyName)
            );

            IllegalArgumentException blankException = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.createCategory(categoryWithBlankName)
            );

            assertThat(nullException.getMessage(), containsString("Category name cannot be null or empty"));
            assertThat(emptyException.getMessage(), containsString("Category name cannot be null or empty"));
            assertThat(blankException.getMessage(), containsString("Category name cannot be null or empty"));
            
            verify(categoryRepository, never()).existsByName(any());
            verify(categoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception when category already exists")
        void shouldThrowExceptionWhenCategoryAlreadyExists() {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("Work");
            categoryToCreate.setDescription("Work tasks");

            when(categoryRepository.existsByName("Work")).thenReturn(true);

            // When & Then
            IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.createCategory(categoryToCreate)
            );

            assertThat(exception.getMessage(), containsString("Category with name 'Work' already exists"));
            
            verify(categoryRepository, times(1)).existsByName("Work");
            verify(categoryRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Exists By Name Tests")
    class ExistsByNameTests {

        @Test
        @DisplayName("Should return true when category exists")
        void shouldReturnTrueWhenCategoryExists() {
            // Given
            when(categoryRepository.existsByName("Work")).thenReturn(true);

            // When
            boolean result = categoryService.existsByName("Work");

            // Then
            assertThat(result, is(true));
            
            verify(categoryRepository, times(1)).existsByName("Work");
        }

        @Test
        @DisplayName("Should return false when category does not exist")
        void shouldReturnFalseWhenCategoryDoesNotExist() {
            // Given
            when(categoryRepository.existsByName("NonExistent")).thenReturn(false);

            // When
            boolean result = categoryService.existsByName("NonExistent");

            // Then
            assertThat(result, is(false));
            
            verify(categoryRepository, times(1)).existsByName("NonExistent");
        }

        @Test
        @DisplayName("Should return false when name is null or empty")
        void shouldReturnFalseWhenNameIsNullOrEmpty() {
            // When & Then
            boolean nullResult = categoryService.existsByName(null);
            boolean emptyResult = categoryService.existsByName("");
            boolean blankResult = categoryService.existsByName("   ");

            assertThat(nullResult, is(false));
            assertThat(emptyResult, is(false));
            assertThat(blankResult, is(false));
            
            verify(categoryRepository, never()).existsByName(any());
        }

        @Test
        @DisplayName("Should trim name before checking existence")
        void shouldTrimNameBeforeCheckingExistence() {
            // Given
            when(categoryRepository.existsByName("Work")).thenReturn(true);

            // When
            boolean result = categoryService.existsByName("  Work  ");

            // Then
            assertThat(result, is(true));
            
            verify(categoryRepository, times(1)).existsByName("Work");
        }
    }

    private Category createAnotherCategory() {
        Category anotherCategory = new Category();
        anotherCategory.setId(2L);
        anotherCategory.setName("Personal");
        anotherCategory.setDescription("Personal tasks and activities");
        anotherCategory.setCreatedAt(LocalDateTime.now());
        return anotherCategory;
    }
}