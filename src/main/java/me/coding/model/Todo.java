package me.coding.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "todos")
@Schema(description = "Todo item", 
        example = "{\"id\": 1, \"title\": \"Complete project\", \"description\": \"Finish the todo application\", \"completed\": false, \"important\": true, \"category\": \"Work\", \"dueDate\": \"2024-12-31\", \"createdAt\": \"2024-01-15T10:30:00\", \"updatedAt\": \"2024-01-15T10:30:00\"}")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Todo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the todo", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    private Long id;
    
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    @Column(nullable = false, length = 100)
    @Schema(description = "Title of the todo", example = "Buy groceries", required = true)
    private String title;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    @Column(length = 500)
    @Schema(description = "Description of the todo", example = "Buy milk, bread, and eggs")
    private String description;
    
    @Column(nullable = false)
    @Schema(description = "Completion status of the todo", example = "false")
    private Boolean completed = false;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Creation timestamp", example = "2024-01-01T10:00:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @Schema(description = "Last update timestamp", example = "2024-01-01T10:30:00", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @Size(max = 50, message = "Category must not exceed 50 characters")
    @Column(length = 50)
    @Schema(description = "Category of the todo", example = "Personal")
    private String category;
    
    @Column(nullable = false)
    @Schema(description = "Important status of the todo", example = "false")
    private Boolean important = false;
    
    @Column(name = "due_date")
    @Schema(description = "Due date of the todo (YYYY-MM-DD format)", example = "2024-01-15", format = "date")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dueDate;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public Todo(String title, String description) {
        this.title = title;
        this.description = description;
        this.completed = false;
        this.important = false;
    }
    
    public Todo(String title, String description, String category) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.completed = false;
        this.important = false;
    }
    
    public Todo(String title, String description, String category, Boolean important) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.completed = false;
        this.important = important != null ? important : false;
    }
    
    public Todo(String title, String description, String category, Boolean important, LocalDate dueDate) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.completed = false;
        this.important = important != null ? important : false;
        this.dueDate = dueDate;
    }
    
    // Explicit setters needed for service layer operations
    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }
    
    public void setImportant(Boolean important) {
        this.important = important;
    }
}