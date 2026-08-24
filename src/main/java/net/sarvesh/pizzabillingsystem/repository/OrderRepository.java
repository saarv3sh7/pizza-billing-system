package net.sarvesh.pizzabillingsystem.repository;

import net.sarvesh.pizzabillingsystem.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    long countByCreatedAtBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
    List<Order> findByCreatedAtBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);

    // Fetch the 50 most recent orders for the initial history view
    List<Order> findTop50ByOrderByCreatedAtDesc();

    // Custom query to search by Invoice No, Token, or Phone
    @Query("SELECT o FROM Order o WHERE " +
            "LOWER(o.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(o.tokenNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "o.customerMobile LIKE CONCAT('%', :query, '%') " +
            "ORDER BY o.createdAt DESC")
    List<Order> searchOrders(@Param("query") String query);
}