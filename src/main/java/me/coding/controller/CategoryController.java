package me.coding.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import me.coding.dto.ErrorResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.coding.model.Category;
import me.coding.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Category Management", description = "Operations for managing categories")
public class CategoryController {
    
    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);
    private final CategoryService categoryService;
    
    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieve all categories")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved categories",
                content = @Content(mediaType = "application/json", 
                schema = @Schema(type = "array", implementation = Category.class),
                examples = @io.swagger.v3.oas.annotations.media.ExampleObject(
                        name = "Category List",
                        value = "[{\"id\": 1, \"name\": \"Work\", \"description\": \"Work-related tasks\", \"createdAt\": \"2024-01-15T10:30:00\"}, {\"id\": 2, \"name\": \"Personal\", \"description\": \"Personal tasks\", \"createdAt\": \"2024-01-15T10:35:00\"}]"
                )))
    })
    public ResponseEntity<List<Category>> getAllCategories() {
        log.info("GET /api/v1/categories - Getting all categories");
        
        List<Category> categories = categoryService.findAllCategories();
        
        log.info("GET /api/v1/categories - Returning {} categories", categories.size());
        return ResponseEntity.ok(categories);
    }
    
    @PostMapping
    @Operation(summary = "Create new category", description = "Create a new category")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Category created successfully",
                content = @Content(mediaType = "application/json", 
                schema = @Schema(implementation = Category.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "409", description = "Category with this name already exists",
                content = @Content(mediaType = "application/json",
                schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Category> createCategory(@Valid @RequestBody Category category) {
        log.info("POST /api/v1/categories - Creating category: {}", category.getName());
        Category createdCategory = categoryService.createCategory(category);
        log.info("POST /api/v1/categories - Created category with id: {}", createdCategory.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdCategory);
    }
}