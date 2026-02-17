package com.example.restaurant.controller.dto;

import com.example.restaurant.model.enums.OrderStatus;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

public class OrderRequest {
    @NotNull
    private Long diningTableId;
    private Long customerId;
    private OrderStatus status;

    @Valid
    private List<OrderItemRequest> items;

    public Long getDiningTableId() {
        return diningTableId;
    }

    public void setDiningTableId(Long diningTableId) {
        this.diningTableId = diningTableId;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }
}
