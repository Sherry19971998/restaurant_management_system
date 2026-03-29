package com.example.adminservice.controller.dto;

import com.example.adminservice.model.enums.ReservationStatus;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReservationRequest {
        // 可选：用于自动创建顾客
        private String customerName;
        private String customerPhone;
        private String customerEmail;
    private LocalDateTime reservationTime;

    @Min(1)
    private int partySize;
    private ReservationStatus status;

    @NotNull
    private Long diningTableId;

    @NotNull
    private Long customerId;

    public LocalDateTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalDateTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public int getPartySize() {
        return partySize;
    }

    public void setPartySize(int partySize) {
        this.partySize = partySize;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

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

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }
}
