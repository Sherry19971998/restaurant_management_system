package com.example.restaurant.controller;

import com.example.restaurant.controller.dto.OrderRequest;
import com.example.restaurant.model.RestaurantOrder;
import com.example.restaurant.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<RestaurantOrder> getAll() {
        return orderService.getAll();
    }

    @GetMapping("/{id}")
    public RestaurantOrder getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PostMapping
    public RestaurantOrder create(@Valid @RequestBody OrderRequest request) {
        return orderService.create(request);
    }
}
