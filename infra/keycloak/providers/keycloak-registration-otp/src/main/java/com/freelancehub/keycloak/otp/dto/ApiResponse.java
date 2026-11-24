package com.freelancehub.keycloak.otp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse {
    private boolean success;
    private String message;
    private Long expiresIn;
    private Long cooldown;
    private String verificationTicket;
    private String email;

    public ApiResponse() {}

    public static ApiResponse ok(String message, Long expiresIn, Long cooldown) {
        ApiResponse resp = new ApiResponse();
        resp.success = true;
        resp.message = message;
        resp.expiresIn = expiresIn;
        resp.cooldown = cooldown;
        return resp;
    }

    public static ApiResponse verified(String message, String verificationTicket, String email, Long expiresIn) {
        ApiResponse resp = new ApiResponse();
        resp.success = true;
        resp.message = message;
        resp.verificationTicket = verificationTicket;
        resp.email = email;
        resp.expiresIn = expiresIn;
        return resp;
    }

    public static ApiResponse error(String message) {
        ApiResponse resp = new ApiResponse();
        resp.success = false;
        resp.message = message;
        return resp;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public Long getCooldown() {
        return cooldown;
    }

    public void setCooldown(Long cooldown) {
        this.cooldown = cooldown;
    }

    public String getVerificationTicket() {
        return verificationTicket;
    }

    public void setVerificationTicket(String verificationTicket) {
        this.verificationTicket = verificationTicket;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
