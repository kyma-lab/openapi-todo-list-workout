package me.coding.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String resourceType, Long id) {
        super(String.format("%s with id %d not found", resourceType, id));
    }
    
    public ResourceNotFoundException(String resourceType, String identifier, String identifierType) {
        super(String.format("%s with %s '%s' not found", resourceType, identifierType, identifier));
    }
}