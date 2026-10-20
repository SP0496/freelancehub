package com.freelancehub.marketplace.project;

import java.math.BigDecimal;
import java.time.Instant;

public record ProjectResponse(
        String id,
        String title,
        String description,
        BigDecimal budget,
        String currency,
        String status,
        Long version,
        Instant createdAt,
        Instant updatedAt
) {

    public static ProjectResponse from(ProjectEntity project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getDescription(),
                project.getBudget(),
                project.getCurrency(),
                project.getStatus(),
                project.getVersion(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
