package com.example.adminservice.controller.dto;

import com.example.adminservice.model.enums.TableStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateTableStatusRequest {
    @NotNull
    private TableStatus status;

    public TableStatus getStatus() {
        return status;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }
}