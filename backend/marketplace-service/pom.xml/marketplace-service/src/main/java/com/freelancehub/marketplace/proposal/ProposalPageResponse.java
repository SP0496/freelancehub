package com.freelancehub.marketplace.proposal;

import java.util.List;

public record ProposalPageResponse(
        List<ProposalResponse> proposals,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
}