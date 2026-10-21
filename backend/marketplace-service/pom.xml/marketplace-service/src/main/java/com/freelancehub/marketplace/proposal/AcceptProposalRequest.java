package com.freelancehub.marketplace.proposal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record AcceptProposalRequest(

        @NotNull(message = "Project version is required")
        @PositiveOrZero(message = "Project version must be 0 or greater")
        Long projectVersion,

        @NotNull(message = "Proposal version is required")
        @PositiveOrZero(message = "Proposal version must be 0 or greater")
        Long proposalVersion

) {
}
