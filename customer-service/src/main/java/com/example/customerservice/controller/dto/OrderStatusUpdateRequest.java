package com.example.customerservice.controller.dto;

import com.example.customerservice.model.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

/**
 * DTO for UC-3: Update Order Status.
 *
 * The client sends this in the request body to specify the new status
 * they want to move the order to (e.g., IN_PROGRESS, READY, etc.).
 *
 * The @NotNull annotation ensures the client cannot send an empty body.
 */
public class OrderStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private OrderStatus status;

    // Default constructor (needed by Jackson to deserialize JSON)
    public OrderStatusUpdateRequest() {
    }

    // Getter — Spring/Jackson uses this to read the value
    public OrderStatus getStatus() {
        return status;
    }

    // Setter — Spring/Jackson uses this to write the value from JSON
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
