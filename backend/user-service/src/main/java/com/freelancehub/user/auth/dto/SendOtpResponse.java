package com.freelancehub.user.auth.dto;

public record SendOtpResponse(
        boolean success,
        String message,
        String maskedEmail,
        Integer expiresIn,
        Integer cooldown
) {
    public static SendOtpResponse of(boolean success, String message, String maskedEmail, Integer expiresIn, Integer cooldown) {
        return new SendOtpResponse(success, message, maskedEmail, expiresIn, cooldown);
    }
}
