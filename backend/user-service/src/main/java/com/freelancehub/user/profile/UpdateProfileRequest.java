package com.freelancehub.user.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(

        @NotBlank
        @Size(max = 100)
        String displayName,

        @Size(max = 160)
        String headline

) {
}