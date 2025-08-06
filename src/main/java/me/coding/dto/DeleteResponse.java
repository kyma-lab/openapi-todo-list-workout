package me.coding.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response for successful delete operation", 
        example = "{\"message\": \"Todo successfully deleted\", \"deletedId\": 1}")
public class DeleteResponse {
    
    @Schema(description = "Confirmation message", example = "Todo successfully deleted")
    private String message;
    
    @Schema(description = "ID of the deleted resource", example = "1")
    private Long deletedId;
}