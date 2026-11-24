package com.freelancehub.user.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendOtpRequest(
        @NotBlank(message = "Email address is required")
        @Email(message = "Invalid email format")
        String email,

        String username
) {
}
