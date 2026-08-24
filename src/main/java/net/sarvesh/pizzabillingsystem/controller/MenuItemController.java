package net.sarvesh.pizzabillingsystem.controller;

import net.sarvesh.pizzabillingsystem.entity.MenuItem;
import net.sarvesh.pizzabillingsystem.repository.CategoryRepository;
import net.sarvesh.pizzabillingsystem.repository.MenuItemRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*") // Crucial: Allows your Vite React app (port 5173) to call this API
public class MenuItemController {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;

    public MenuItemController(MenuItemRepository menuItemRepository, CategoryRepository categoryRepository) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
    }

    // GET: /api/menu
    @GetMapping
    public List<MenuItem> getAllActiveMenuItems() {
        return menuItemRepository.findByActiveTrue();
    }

    // GET: /api/menu/search?query=041
    @GetMapping("/search")
    public ResponseEntity<List<MenuItem>> searchMenu(@RequestParam String query) {
        // Searches by your 5-digit code OR the item name (e.g., "Margherita")
        List<MenuItem> results = menuItemRepository
                .findByItemCodeContainingOrNameContainingIgnoreCase(query, query);
        return ResponseEntity.ok(results);
    }

    // POST: /api/menu (Create new item)
    @PostMapping
    public ResponseEntity<MenuItem> addMenuItem(@RequestBody MenuItem menuItem) {
        // In a real app, you might want to validate that the itemCode is exactly 5 digits here
        MenuItem savedItem = menuItemRepository.save(menuItem);
        return ResponseEntity.ok(savedItem);
    }

    // PUT: /api/menu/{id} (Update existing item)
    @PutMapping("/{id}")
    public ResponseEntity<MenuItem> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updatedItem) {
        return menuItemRepository.findById(id).map(item -> {
            item.setItemCode(updatedItem.getItemCode());
            item.setName(updatedItem.getName());
            item.setDescription(updatedItem.getDescription());
            item.setPrice(updatedItem.getPrice());
            item.setCategory(updatedItem.getCategory());
            item.setActive(updatedItem.isActive());
            return ResponseEntity.ok(menuItemRepository.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE: /api/menu/{id} (Hard delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        menuItemRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // NEW GET ENDPOINT: /api/menu/next-code?categoryId=1
    @GetMapping("/next-code")
    public ResponseEntity<Map<String, String>> getNextItemCode(@RequestParam Long categoryId) {
        return categoryRepository.findById(categoryId).map(category -> {

            String maxCode = menuItemRepository.findMaxItemCodeByCategoryId(categoryId);
            String nextCode;

            if (maxCode != null && maxCode.length() == 5) {
                // If items already exist, just parse the 5-digit code as an integer and add 1
                int numericCode = Integer.parseInt(maxCode);
                nextCode = String.format("%05d", numericCode + 1);
            } else {
                // If this is the VERY FIRST item in this category, format it based on your rules
                String cCode = category.getCode();
                if (cCode.length() == 2) {
                    nextCode = cCode + "101"; // e.g., "08" becomes "08101"
                } else if (cCode.length() == 3) {
                    nextCode = cCode + "01";  // e.g., "041" becomes "04101"
                } else {
                    nextCode = cCode + "1";   // Fallback
                }
            }

            Map<String, String> response = new HashMap<>();
            response.put("nextCode", nextCode);
            return ResponseEntity.ok(response);

        }).orElse(ResponseEntity.badRequest().build());
    }
}