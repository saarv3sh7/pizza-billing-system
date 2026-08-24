package net.sarvesh.pizzabillingsystem.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        // Hardcoded check for demonstration.
        // Later, replace this with database lookup and password hashing (BCrypt).
        if ("admin".equals(loginRequest.getUsername()) && "Pass@123".equals(loginRequest.getPassword())) {

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("username", loginRequest.getUsername());
            response.put("role", "ADMIN");

            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }
}

// Inner DTO class to capture the incoming JSON
class LoginRequest {
    private String username;
    private String password;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}