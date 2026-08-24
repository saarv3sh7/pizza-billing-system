package net.sarvesh.pizzabillingsystem.service;

import net.sarvesh.pizzabillingsystem.entity.Order;
import net.sarvesh.pizzabillingsystem.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrderRepository orderRepository;

    public DashboardService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Map<String, Object> getTodayStats() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // We will need to add this custom query to your OrderRepository:
        // List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
        List<Order> todaysOrders = orderRepository.findByCreatedAtBetween(startOfDay, endOfDay);

        BigDecimal totalSales = todaysOrders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalOrders = todaysOrders.size();

        // Group by payment method (e.g., CASH: 5, UPI: 12)
        Map<String, Long> paymentSplit = todaysOrders.stream()
                .collect(Collectors.groupingBy(
                        Order::getPaymentMethod,
                        Collectors.counting()
                ));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSales", totalSales);
        stats.put("totalOrders", totalOrders);
        stats.put("paymentSplit", paymentSplit);
        stats.put("date", LocalDate.now().toString());

        return stats;
    }
}