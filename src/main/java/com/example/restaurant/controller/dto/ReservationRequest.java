package com.example.restaurant.controller.dto;

import com.example.restaurant.model.enums.ReservationStatus;
import java.time.LocalDateTime;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ReservationRequest {
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
}
