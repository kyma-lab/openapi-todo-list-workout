package me.coding.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import me.coding.model.Category;
import me.coding.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CategoryController.class)
@DisplayName("CategoryController Tests")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Autowired
    private ObjectMapper objectMapper;

    private Category testCategory;
    private final Long CATEGORY_ID = 1L;

    @BeforeEach
    void setUp() {
        testCategory = new Category();
        testCategory.setId(CATEGORY_ID);
        testCategory.setName("Work");
        testCategory.setDescription("Work related tasks");
        testCategory.setCreatedAt(LocalDateTime.of(2024, 1, 15, 10, 0));
    }

    @Nested
    @DisplayName("GET /api/v1/categories Tests")
    class GetCategoriesTests {

        @Test
        @DisplayName("Should return all categories successfully")
        void shouldReturnAllCategoriesSuccessfully() throws Exception {
            // Given
            List<Category> categories = Arrays.asList(testCategory, createPersonalCategory());
            when(categoryService.findAllCategories()).thenReturn(categories);

            // When & Then
            mockMvc.perform(get("/api/v1/categories"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(2)))
                    .andExpect(jsonPath("$[0].id", is(1)))
                    .andExpect(jsonPath("$[0].name", is("Work")))
                    .andExpect(jsonPath("$[0].description", is("Work related tasks")))
                    .andExpect(jsonPath("$[0].createdAt", is("2024-01-15T10:00:00")))
                    .andExpect(jsonPath("$[1].id", is(2)))
                    .andExpect(jsonPath("$[1].name", is("Personal")));

            verify(categoryService, times(1)).findAllCategories();
        }

        @Test
        @DisplayName("Should return empty list when no categories exist")
        void shouldReturnEmptyListWhenNoCategoriesExist() throws Exception {
            // Given
            when(categoryService.findAllCategories()).thenReturn(Collections.emptyList());

            // When & Then
            mockMvc.perform(get("/api/v1/categories"))
                    .andDo(print())
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$", hasSize(0)));

            verify(categoryService, times(1)).findAllCategories();
        }
    }

    @Nested
    @DisplayName("POST /api/v1/categories Tests")
    class CreateCategoryTests {

        @Test
        @DisplayName("Should create category successfully")
        void shouldCreateCategorySuccessfully() throws Exception {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("Health");
            categoryToCreate.setDescription("Health and fitness tasks");

            Category createdCategory = new Category();
            createdCategory.setId(3L);
            createdCategory.setName("Health");
            createdCategory.setDescription("Health and fitness tasks");
            createdCategory.setCreatedAt(LocalDateTime.of(2024, 1, 15, 11, 0));

            when(categoryService.createCategory(any(Category.class))).thenReturn(createdCategory);

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(categoryToCreate)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(3)))
                    .andExpect(jsonPath("$.name", is("Health")))
                    .andExpect(jsonPath("$.description", is("Health and fitness tasks")))
                    .andExpect(jsonPath("$.createdAt", is("2024-01-15T11:00:00")));

            verify(categoryService, times(1)).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should create category with minimal data")
        void shouldCreateCategoryWithMinimalData() throws Exception {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("Shopping");

            Category createdCategory = new Category();
            createdCategory.setId(4L);
            createdCategory.setName("Shopping");
            createdCategory.setCreatedAt(LocalDateTime.of(2024, 1, 15, 12, 0));

            when(categoryService.createCategory(any(Category.class))).thenReturn(createdCategory);

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(categoryToCreate)))
                    .andDo(print())
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(4)))
                    .andExpect(jsonPath("$.name", is("Shopping")))
                    .andExpect(jsonPath("$.description").doesNotExist())
                    .andExpect(jsonPath("$.createdAt", is("2024-01-15T12:00:00")));

            verify(categoryService, times(1)).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should return 400 for invalid category data")
        void shouldReturn400ForInvalidCategoryData() throws Exception {
            // Given - Category without required name
            Category invalidCategory = new Category();
            invalidCategory.setDescription("Description without name");

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidCategory)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(categoryService, never()).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should return 400 for category name too long")
        void shouldReturn400ForCategoryNameTooLong() throws Exception {
            // Given - Category with name longer than 50 characters
            Category invalidCategory = new Category();
            invalidCategory.setName("This is a very long category name that exceeds the maximum allowed length of 50 characters");
            invalidCategory.setDescription("Valid description");

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidCategory)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(categoryService, never()).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should return 400 for category description too long")
        void shouldReturn400ForCategoryDescriptionTooLong() throws Exception {
            // Given - Category with description longer than 200 characters
            Category invalidCategory = new Category();
            invalidCategory.setName("ValidName");
            invalidCategory.setDescription("This is a very long description that exceeds the maximum allowed length of 200 characters. " +
                    "It contains way too much text and should trigger a validation error when trying to create a new category with this data.");

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidCategory)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(categoryService, never()).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should return 409 when category already exists")
        void shouldReturn409WhenCategoryAlreadyExists() throws Exception {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("Work");
            categoryToCreate.setDescription("Work tasks");

            when(categoryService.createCategory(any(Category.class)))
                    .thenThrow(new IllegalArgumentException("Category with name 'Work' already exists"));

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(categoryToCreate)))
                    .andDo(print())
                    .andExpect(status().isConflict());

            verify(categoryService, times(1)).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should return 400 for invalid input data")
        void shouldReturn400ForInvalidInputData() throws Exception {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("ValidName");
            categoryToCreate.setDescription("Valid description");

            when(categoryService.createCategory(any(Category.class)))
                    .thenThrow(new IllegalArgumentException("Category name cannot be null or empty"));

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(categoryToCreate)))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(categoryService, times(1)).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should return 500 for unexpected errors")
        void shouldReturn500ForUnexpectedErrors() throws Exception {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("ValidName");
            categoryToCreate.setDescription("Valid description");

            when(categoryService.createCategory(any(Category.class)))
                    .thenThrow(new RuntimeException("Database connection failed"));

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(categoryToCreate)))
                    .andDo(print())
                    .andExpect(status().isInternalServerError());

            verify(categoryService, times(1)).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should handle malformed JSON")
        void shouldHandleMalformedJson() throws Exception {
            // Given - malformed JSON
            String malformedJson = "{ \"name\": \"Work\", \"description\": }";

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(malformedJson))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(categoryService, never()).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should handle missing content type")
        void shouldHandleMissingContentType() throws Exception {
            // Given
            Category categoryToCreate = new Category();
            categoryToCreate.setName("Work");

            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .content(objectMapper.writeValueAsString(categoryToCreate)))
                    .andDo(print())
                    .andExpect(status().isUnsupportedMediaType());

            verify(categoryService, never()).createCategory(any(Category.class));
        }

        @Test
        @DisplayName("Should handle empty request body")
        void shouldHandleEmptyRequestBody() throws Exception {
            // When & Then
            mockMvc.perform(post("/api/v1/categories")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(""))
                    .andDo(print())
                    .andExpect(status().isBadRequest());

            verify(categoryService, never()).createCategory(any(Category.class));
        }
    }

    @Nested
    @DisplayName("Cross-Origin Tests")
    class CrossOriginTests {

        @Test
        @DisplayName("Should handle CORS preflight request")
        void shouldHandleCorsPreflight() throws Exception {
            // When & Then
            mockMvc.perform(options("/api/v1/categories")
                            .header("Origin", "http://localhost:3000")
                            .header("Access-Control-Request-Method", "POST")
                            .header("Access-Control-Request-Headers", "Content-Type"))
                    .andDo(print())
                    .andExpect(status().isOk());
        }
    }

    private Category createPersonalCategory() {
        Category personalCategory = new Category();
        personalCategory.setId(2L);
        personalCategory.setName("Personal");
        personalCategory.setDescription("Personal tasks and activities");
        personalCategory.setCreatedAt(LocalDateTime.of(2024, 1, 15, 10, 30));
        return personalCategory;
    }
}