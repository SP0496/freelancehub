package com.freelancehub.user.auth.dto;

public record VerifyOtpResponse(
        boolean success,
        String message,
        String verificationTicket,
        String email,
        Integer expiresIn
) {
    public static VerifyOtpResponse of(boolean success, String message, String verificationTicket, String email, Integer expiresIn) {
        return new VerifyOtpResponse(success, message, verificationTicket, email, expiresIn);
    }
}
