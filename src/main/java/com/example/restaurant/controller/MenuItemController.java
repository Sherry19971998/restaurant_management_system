package com.example.restaurant.controller;

import com.example.restaurant.controller.dto.MenuItemRequest;
import com.example.restaurant.model.MenuItem;
import com.example.restaurant.service.MenuItemService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PatchMapping;
@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {
    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public List<MenuItem> getAll() {
        return menuItemService.getAll();
    }

    @GetMapping("/{id}")
    public MenuItem getById(@PathVariable Long id) {
        return menuItemService.getById(id);
    }

    @PostMapping
    public MenuItem create(@Valid @RequestBody MenuItemRequest request) {
        return menuItemService.create(request);
    }
    
    @PatchMapping("/update/{id}")
    public MenuItem update(@PathVariable Long id, @RequestBody MenuItemRequest request) {
    	return menuItemService.update(id, request);
    }
}
