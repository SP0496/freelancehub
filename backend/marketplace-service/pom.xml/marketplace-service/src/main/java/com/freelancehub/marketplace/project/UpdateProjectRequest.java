package com.freelancehub.marketplace.project;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateProjectRequest(

        @NotBlank(message = "Title is required")
        @Size(max = 150, message = "Title must not exceed 150 characters")
        String title,

        @NotBlank(message = "Description is required")
        @Size(max = 10000, message = "Description must not exceed 10000 characters")
        String description,

        @NotNull(message = "Budget is required")
        @DecimalMin(value = "0.01", message = "Budget must be at least 0.01")
        @Digits(integer = 10, fraction = 2,
                message = "Budget allows up to 10 digits and 2 decimal places")
        BigDecimal budget,

        @NotNull(message = "Version is required")
        @PositiveOrZero(message = "Version must be 0 or greater")
        Long version

) {
}
