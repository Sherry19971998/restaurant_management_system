package com.example.customerservice.controller.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PaymentRequest {
    @NotNull
    private String paymentMethod;

    @NotNull
    private BigDecimal amount;

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}