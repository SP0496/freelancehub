package com.freelancehub.user.auth.dto;

public record ForgotPasswordResponse(
        boolean success,
        String message,
        String maskedEmail
) {
    public static ForgotPasswordResponse of(boolean success, String message, String maskedEmail) {
        return new ForgotPasswordResponse(success, message, maskedEmail);
    }
}
