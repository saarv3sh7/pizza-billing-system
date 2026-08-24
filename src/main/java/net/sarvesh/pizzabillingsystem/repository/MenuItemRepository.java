package net.sarvesh.pizzabillingsystem.repository;

import net.sarvesh.pizzabillingsystem.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    Optional<MenuItem> findByItemCode(String itemCode);
    List<MenuItem> findByActiveTrue();
    List<MenuItem> findByItemCodeContainingOrNameContainingIgnoreCase(String code, String name);

    // NEW: Finds the highest item code currently used in a specific category
    @Query("SELECT MAX(m.itemCode) FROM MenuItem m WHERE m.category.id = :categoryId")
    String findMaxItemCodeByCategoryId(@Param("categoryId") Long categoryId);
}