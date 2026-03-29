package com.example.adminservice.controller;

import com.example.adminservice.controller.dto.RestaurantRequest;
import com.example.adminservice.model.Restaurant;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.adminservice.service.RestaurantService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {
    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public List<Restaurant> getAll() {
        return restaurantService.getAll();
    }

    @GetMapping("/{id}")
    public Restaurant getById(@PathVariable Long id) {
        return restaurantService.getById(id);
    }

    @PostMapping
    public Restaurant create(@Valid @RequestBody RestaurantRequest request) {
        return restaurantService.create(request);
    }
}
