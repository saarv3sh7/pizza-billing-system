package net.sarvesh.pizzabillingsystem.controller;

import net.sarvesh.pizzabillingsystem.entity.Order;
import net.sarvesh.pizzabillingsystem.repository.OrderRepository;
import net.sarvesh.pizzabillingsystem.service.OrderService;
import net.sarvesh.pizzabillingsystem.service.PdfInvoiceService;
import net.sarvesh.pizzabillingsystem.service.PdfKotService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;
    private final PdfInvoiceService pdfInvoiceService;
    private final OrderRepository orderRepository;
    private final PdfKotService pdfKotService;

    public OrderController(OrderService orderService, PdfInvoiceService pdfInvoiceService, OrderRepository orderRepository, PdfKotService pdfKotService) {
        this.orderService = orderService;
        this.pdfInvoiceService = pdfInvoiceService;
        this.orderRepository = orderRepository;
        this.pdfKotService = pdfKotService;
    }

    // POST: /api/orders
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        // The service handles the 5% / 18% GST math and token generation
        Order savedOrder = orderService.calculateAndSaveOrder(order);
        return ResponseEntity.ok(savedOrder);
    }

    // GET: /api/orders/{id}/invoice
    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));

        byte[] pdfBytes = pdfInvoiceService.generateInvoicePdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        // "inline" tells the browser to open it in a tab/trigger print dialog instead of forcing a file download
        headers.setContentDispositionFormData("inline", "invoice-" + order.getInvoiceNumber() + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    // POST: /api/orders/kot
    @PostMapping("/kot")
    public ResponseEntity<byte[]> generateKot(@RequestBody Order order) {
        // We do NOT save the order here. We just generate the KOT from the incoming payload.
        byte[] pdfBytes = pdfKotService.generateKotPdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "kot.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    // GET: /api/orders/history?query=
    @GetMapping("/history")
    public ResponseEntity<List<Order>> getOrderHistory(@RequestParam(required = false) String query) {
        List<Order> orders;
        if (query != null && !query.trim().isEmpty()) {
            orders = orderRepository.searchOrders(query.trim());
        } else {
            orders = orderRepository.findTop50ByOrderByCreatedAtDesc();
        }
        return ResponseEntity.ok(orders);
    }
}