package com.freelancehub.marketplace.project;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CancelProjectRequest(

        @NotNull(message = "Version is required")
        @PositiveOrZero(message = "Version must be 0 or greater")
        Long version

) {
}
