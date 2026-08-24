package net.sarvesh.pizzabillingsystem.controller;

import net.sarvesh.pizzabillingsystem.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/today")
    public ResponseEntity<Map<String, Object>> getTodayStats() {
        return ResponseEntity.ok(dashboardService.getTodayStats());
    }
}