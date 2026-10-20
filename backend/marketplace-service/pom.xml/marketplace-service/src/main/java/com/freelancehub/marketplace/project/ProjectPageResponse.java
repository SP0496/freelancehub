package com.freelancehub.marketplace.project;

import java.util.List;

public record ProjectPageResponse(
        List<ProjectResponse> projects,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last
) {
}
