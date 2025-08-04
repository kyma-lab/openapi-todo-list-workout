package me.coding.repository;

import me.coding.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    List<Todo> findByCompleted(Boolean completed);
    
    @Query("SELECT t FROM Todo t WHERE t.title LIKE %?1% OR t.description LIKE %?1%")
    List<Todo> findByTitleOrDescriptionContaining(String searchTerm);
    
    List<Todo> findByCompletedOrderByCreatedAtDesc(Boolean completed);
}