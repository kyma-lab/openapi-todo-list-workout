package me.coding.model;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Category for organizing todos")
public class Category {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Schema(description = "Unique identifier of the category", example = "1")
    private Long id;
    
    @NotBlank(message = "Category name is required")
    @Size(max = 50, message = "Category name must be at most 50 characters")
    @Column(nullable = false, unique = true, length = 50)
    @Schema(description = "Name of the category", example = "Personal", required = true)
    private String name;
    
    @Size(max = 200, message = "Category description must be at most 200 characters")
    @Column(length = 200)
    @Schema(description = "Description of the category", example = "Personal tasks and activities")
    private String description;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @Schema(description = "Creation timestamp", example = "2024-01-01T10:00:00")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Explicit getters needed for controller layer operations
    public String getName() {
        return name;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setName(String name) {
        this.name = name;
    }
}