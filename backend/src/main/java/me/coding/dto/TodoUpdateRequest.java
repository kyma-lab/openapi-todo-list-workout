package me.coding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for partial todo updates. Only non-null fields will be updated.",
        example = "{\"completed\": true, \"important\": false, \"title\": \"Updated task\"}")
public class TodoUpdateRequest {
    
    @Size(max = 100, message = "Title must not exceed 100 characters")
    @Schema(description = "Updated title of the todo", example = "Updated task title", maxLength = 100)
    private String title;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Schema(description = "Updated description of the todo", example = "Updated detailed description", maxLength = 500)
    private String description;
    
    @Schema(description = "Updated completion status", example = "true")
    private Boolean completed;
    
    @Schema(description = "Updated important status", example = "false")
    private Boolean important;
    
    @Size(max = 50, message = "Category must not exceed 50 characters")
    @Schema(description = "Updated category", example = "Work", maxLength = 50)
    private String category;
    
    @Schema(description = "Updated due date (YYYY-MM-DD format)", example = "2024-01-15", format = "date")
    private LocalDate dueDate;
    
    // Helper methods to check if fields are present (not null)
    public boolean hasTitle() {
        return title != null;
    }
    
    public boolean hasDescription() {
        return description != null;
    }
    
    public boolean hasCompleted() {
        return completed != null;
    }
    
    public boolean hasImportant() {
        return important != null;
    }
    
    public boolean hasCategory() {
        return category != null;
    }
    
    public boolean hasDueDate() {
        return dueDate != null;
    }
}