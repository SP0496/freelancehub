package com.freelancehub.marketplace.proposal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateProposalRequest(

        @NotBlank(message = "Cover letter is required")
        @Size(max = 10000,
                message = "Cover letter must not exceed 10000 characters")
        String coverLetter,

        @NotNull(message = "Proposed amount is required")
        @DecimalMin(value = "0.01",
                message = "Proposed amount must be at least 0.01")
        @Digits(integer = 10, fraction = 2,
                message = "Amount allows up to 10 digits and 2 decimal places")
        BigDecimal proposedAmount,

        @NotNull(message = "Delivery days are required")
        @Min(value = 1, message = "Delivery days must be at least 1")
        @Max(value = 365, message = "Delivery days must not exceed 365")
        Integer deliveryDays

) {
}