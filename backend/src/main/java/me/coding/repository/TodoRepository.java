package me.coding.repository;

import me.coding.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    List<Todo> findByCompleted(Boolean completed);
    
    @Query("SELECT t FROM Todo t WHERE t.title LIKE %?1% OR t.description LIKE %?1%")
    List<Todo> findByTitleOrDescriptionContaining(String searchTerm);
    
    List<Todo> findByCompletedOrderByCreatedAtDesc(Boolean completed);
    
    List<Todo> findByCategory(String category);
    
    List<Todo> findByCategoryAndCompleted(String category, Boolean completed);
    
    @Query("SELECT t FROM Todo t WHERE (t.title LIKE %?1% OR t.description LIKE %?1%) AND (?2 IS NULL OR t.category = ?2)")
    List<Todo> findByTitleOrDescriptionContainingAndCategory(String searchTerm, String category);
    
    List<Todo> findByImportant(Boolean important);
    
    List<Todo> findByImportantAndCompleted(Boolean important, Boolean completed);
    
    List<Todo> findByImportantAndCategory(Boolean important, String category);
    
    List<Todo> findByImportantAndCategoryAndCompleted(Boolean important, String category, Boolean completed);
    
    // Date-based queries
    List<Todo> findByDueDate(LocalDate dueDate);
    
    List<Todo> findByDueDateAndCompleted(LocalDate dueDate, Boolean completed);
    
    List<Todo> findByDueDateAndImportant(LocalDate dueDate, Boolean important);
    
    List<Todo> findByDueDateAndCategory(LocalDate dueDate, String category);
    
    List<Todo> findByDueDateAndImportantAndCompleted(LocalDate dueDate, Boolean important, Boolean completed);
    
    List<Todo> findByDueDateAndCategoryAndCompleted(LocalDate dueDate, String category, Boolean completed);
    
    List<Todo> findByDueDateAndImportantAndCategory(LocalDate dueDate, Boolean important, String category);
    
    List<Todo> findByDueDateAndImportantAndCategoryAndCompleted(LocalDate dueDate, Boolean important, String category, Boolean completed);
    
    // Date range queries
    List<Todo> findByDueDateBetween(LocalDate startDate, LocalDate endDate);
    
    List<Todo> findByDueDateIsNull();
    
    @Query("SELECT t FROM Todo t WHERE t.dueDate = CURRENT_DATE")
    List<Todo> findTodaysTodos();
    
    @Query("SELECT t FROM Todo t WHERE t.dueDate = CURRENT_DATE AND t.completed = ?1")
    List<Todo> findTodaysTodosByCompleted(Boolean completed);
}