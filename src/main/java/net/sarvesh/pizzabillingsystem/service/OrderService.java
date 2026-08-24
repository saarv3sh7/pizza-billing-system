package net.sarvesh.pizzabillingsystem.service;

import net.sarvesh.pizzabillingsystem.entity.Order;
import net.sarvesh.pizzabillingsystem.repository.OrderRepository;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    // Fixed Tax Rates (Student-friendly constant setup)
    private static final BigDecimal FOOD_GST_RATE = new BigDecimal("0.05");      // 5% total
    private static final BigDecimal DELIVERY_GST_RATE = new BigDecimal("0.18");  // 18% total
    private static final BigDecimal HALF = new BigDecimal("0.5");                // To split into CGST/SGST

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order calculateAndSaveOrder(Order order) {
        // 1. Get initial amounts (default to 0 if null)
        BigDecimal subtotal = order.getSubtotal() != null ? order.getSubtotal() : BigDecimal.ZERO;
        BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal delivery = order.getDeliveryCharge() != null ? order.getDeliveryCharge() : BigDecimal.ZERO;

        // Ensure delivery charge is only applied if order type is DELIVERY
        if (!"DELIVERY".equalsIgnoreCase(order.getOrderType())) {
            delivery = BigDecimal.ZERO;
            order.setDeliveryCharge(BigDecimal.ZERO);
        }

        // 2. Taxable Food Amount (Subtotal - Discount)
        BigDecimal taxableFood = subtotal.subtract(discount);
        if (taxableFood.compareTo(BigDecimal.ZERO) < 0) taxableFood = BigDecimal.ZERO;

        // 3. Calculate Food GST (5%)
        BigDecimal totalFoodGst = taxableFood.multiply(FOOD_GST_RATE);

        // 4. Calculate Delivery GST (18%)
        BigDecimal totalDeliveryGst = delivery.multiply(DELIVERY_GST_RATE);

        // 5. Split equally into CGST and SGST (2.5% + 9% splits)
        BigDecimal totalGst = totalFoodGst.add(totalDeliveryGst);
        BigDecimal cgst = totalGst.multiply(HALF).setScale(2, RoundingMode.HALF_UP);
        BigDecimal sgst = totalGst.multiply(HALF).setScale(2, RoundingMode.HALF_UP);

        order.setCgst(cgst);
        order.setSgst(sgst);

        // 6. Grand Total = Taxable Food + Delivery Charge + CGST + SGST
        BigDecimal grandTotal = taxableFood.add(delivery).add(cgst).add(sgst)
                .setScale(2, RoundingMode.HALF_UP);
        order.setTotalAmount(grandTotal);

        // 7. Generate Daily Token (A001) and Invoice Number
        generateIdentifiers(order);

        // Map the bidirectional relationship for items before saving
        if (order.getItems() != null) {
            order.getItems().forEach(item -> item.setOrder(order));
        }

        return orderRepository.save(order);
    }

    private void generateIdentifiers(Order order) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        // Count today's orders
        long todayOrderCount = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        long nextSequence = todayOrderCount + 1;

        // Format Token: A001, A002
        String token = String.format("A%03d", nextSequence);
        order.setTokenNumber(token);

        // Format Invoice: INV-YYYYMMDD-001
        String dateStr = LocalDate.now().toString().replace("-", "");
        String invoiceNumber = String.format("INV-%s-%03d", dateStr, nextSequence);
        order.setInvoiceNumber(invoiceNumber);
    }
}