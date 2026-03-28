package com.example.customerservice.controller;

import com.example.customerservice.controller.dto.OrderRequest;
import com.example.customerservice.controller.dto.OrderStatusUpdateRequest;
import com.example.customerservice.model.RestaurantOrder;
import com.example.customerservice.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
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

    // UC-3: Update Order Status (Kitchen)
    // PATCH /api/orders/{id}/status
    // Kitchen staff sends the new status in the request body, e.g.: { "status": "READY" }
    // The service layer validates the transition (no skipping, no going backward).
    @PatchMapping("/{id}/status")
    public RestaurantOrder updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        return orderService.updateStatus(id, request.getStatus());
    }
}
