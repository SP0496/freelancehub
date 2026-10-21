package com.freelancehub.marketplace.project;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CompleteProjectRequest(

        @NotNull(message = "Project version is required")
        @PositiveOrZero(message = "Project version must be 0 or greater")
        Long version

) {
}
