package com.freelancehub.marketplace.proposal;

import java.math.BigDecimal;
import java.time.Instant;

public record ProposalResponse(
        String id,
        String projectId,
        String coverLetter,
        BigDecimal proposedAmount,
        int deliveryDays,
        String status,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {

    public static ProposalResponse from(ProposalEntity proposal) {
        return new ProposalResponse(
                proposal.getId(),
                proposal.getProjectId(),
                proposal.getCoverLetter(),
                proposal.getProposedAmount(),
                proposal.getDeliveryDays(),
                proposal.getStatus(),
                proposal.getVersion(),
                proposal.getCreatedAt(),
                proposal.getUpdatedAt()
        );
    }
}