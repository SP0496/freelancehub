package com.freelancehub.marketplace.proposal;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "proposals")
public class ProposalEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "freelancer_subject", nullable = false, length = 255)
    private String freelancerSubject;

    @Column(name = "cover_letter", nullable = false, columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "proposed_amount", nullable = false,
            precision = 12, scale = 2)
    private BigDecimal proposedAmount;

    @Column(name = "delivery_days", nullable = false)
    private int deliveryDays;

    @Column(nullable = false, length = 20)
    private String status;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ProposalEntity() {
    }

    public ProposalEntity(
            String projectId,
            String freelancerSubject,
            String coverLetter,
            BigDecimal proposedAmount,
            int deliveryDays) {

        this.id = UUID.randomUUID().toString();
        this.projectId = projectId;
        this.freelancerSubject = freelancerSubject;
        this.coverLetter = coverLetter;
        this.proposedAmount = proposedAmount;
        this.deliveryDays = deliveryDays;
        this.status = "SUBMITTED";
    }

    public void accept() {
        this.status = "ACCEPTED";
    }

    public void reject() {
        this.status = "REJECTED";
    }

    public void withdraw() {
        this.status = "WITHDRAWN";
    }

    @PrePersist
    void beforeInsert() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void beforeUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public String getProjectId() {
        return projectId;
    }

    public String getFreelancerSubject() {
        return freelancerSubject;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public BigDecimal getProposedAmount() {
        return proposedAmount;
    }

    public int getDeliveryDays() {
        return deliveryDays;
    }

    public String getStatus() {
        return status;
    }

    public Long getVersion() {
        return version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}