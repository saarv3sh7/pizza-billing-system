package net.sarvesh.pizzabillingsystem.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String invoiceNumber; // e.g., INV-20260806-001

    @Column(nullable = false)
    private String tokenNumber; // e.g., A001

    @Column(nullable = false)
    private String orderType; // DINE_IN, TAKEAWAY, DELIVERY

    private String customerMobile; // Only phone number

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal; // Total of all food items

    @Column(precision = 10, scale = 2)
    private BigDecimal discountAmount;

    @Column(precision = 10, scale = 2)
    private BigDecimal deliveryCharge; // Only applies to DELIVERY

    @Column(precision = 10, scale = 2)
    private BigDecimal cgst; // 2.5% on food + 9% on delivery

    @Column(precision = 10, scale = 2)
    private BigDecimal sgst; // 2.5% on food + 9% on delivery

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount; // Grand total payable

    private String paymentMethod; // CASH, CARD, UPI, COUPON

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}