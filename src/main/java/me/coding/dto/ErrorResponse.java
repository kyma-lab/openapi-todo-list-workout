package me.coding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Error response structure")
public class ErrorResponse {
    
    @Schema(description = "HTTP status code", example = "404")
    private int status;
    
    @Schema(description = "Error message", example = "Resource not found")
    private String message;
    
    @Schema(description = "Error details", example = "Todo with id 123 not found")
    private String details;
    
    @Schema(description = "Timestamp when the error occurred", example = "2024-01-01T10:00:00")
    private LocalDateTime timestamp;
    
    @Schema(description = "Request path", example = "/api/v1/todos/123")
    private String path;
    
    public ErrorResponse(int status, String message, String details, String path) {
        this.status = status;
        this.message = message;
        this.details = details;
        this.path = path;
        this.timestamp = LocalDateTime.now();
    }
}