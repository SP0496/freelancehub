package com.freelancehub.user.auth.dto;

public record RegisterResponse(
        boolean success,
        String message,
        String userId,
        String username,
        String email,
        String role
) {
    public static RegisterResponse of(boolean success, String message, String userId, String username, String email, String role) {
        return new RegisterResponse(success, message, userId, username, email, role);
    }
}
