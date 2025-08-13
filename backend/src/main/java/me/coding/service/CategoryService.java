package me.coding.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.coding.model.Category;
import me.coding.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {
    
    private final CategoryRepository categoryRepository;
    
    public List<Category> findAllCategories() {
        log.debug("Getting all categories");
        List<Category> categories = categoryRepository.findAll();
        log.debug("Found {} categories", categories.size());
        return categories;
    }
    
    public Optional<Category> findCategoryById(Long id) {
        if (id == null) {
            log.warn("Attempted to get category with null id");
            return Optional.empty();
        }
        
        log.debug("Getting category with id: {}", id);
        Optional<Category> category = categoryRepository.findById(id);
        
        if (category.isPresent()) {
            log.debug("Found category with id: {}", id);
        } else {
            log.debug("No category found with id: {}", id);
        }
        
        return category;
    }
    
    public Optional<Category> findCategoryByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            log.warn("Attempted to get category with null or empty name");
            return Optional.empty();
        }
        
        log.debug("Getting category with name: {}", name);
        Optional<Category> category = categoryRepository.findByName(name.trim());
        
        if (category.isPresent()) {
            log.debug("Found category with name: {}", name);
        } else {
            log.debug("No category found with name: {}", name);
        }
        
        return category;
    }
    
    public Category createCategory(Category category) {
        if (category == null) {
            log.error("Attempted to create null category");
            throw new IllegalArgumentException("Category cannot be null");
        }
        
        String name = category.getName();
        if (name == null || name.trim().isEmpty()) {
            log.error("Attempted to create category with null or empty name");
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }
        
        // Trim the name
        category.setName(name.trim());
        
        // Check if category already exists
        if (categoryRepository.existsByName(category.getName())) {
            log.error("Attempted to create category with existing name: {}", category.getName());
            throw new IllegalArgumentException("Category with name '" + category.getName() + "' already exists");
        }
        
        log.debug("Creating new category: {}", category.getName());
        Category savedCategory = categoryRepository.save(category);
        log.info("Created category with id: {} and name: {}", savedCategory.getId(), savedCategory.getName());
        
        return savedCategory;
    }
    
    public boolean existsByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        
        boolean exists = categoryRepository.existsByName(name.trim());
        log.debug("Category exists check for name '{}': {}", name, exists);
        return exists;
    }
}