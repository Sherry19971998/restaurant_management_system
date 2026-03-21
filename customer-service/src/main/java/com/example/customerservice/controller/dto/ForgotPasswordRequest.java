package com.example.customerservice.controller.dto;

public class ForgotPasswordRequest {
    private String emailOrUsername;
    public String getEmailOrUsername() { return emailOrUsername; }
    public void setEmailOrUsername(String emailOrUsername) { this.emailOrUsername = emailOrUsername; }
}
