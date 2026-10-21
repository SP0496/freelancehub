package com.freelancehub.marketplace.proposal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record WithdrawProposalRequest(

        @NotNull(message = "Proposal version is required")
        @PositiveOrZero(message = "Proposal version must be 0 or greater")
        Long version

) {
}
