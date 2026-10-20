package com.freelancehub.user.profile;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class ProfileEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "identity_subject", nullable = false, unique = true)
    private String identitySubject;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(length = 160)
    private String headline;

    @Version
    @Column(nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ProfileEntity() {
    }

    public ProfileEntity(
            String identitySubject,
            String displayName,
            String headline) {

        this.id = UUID.randomUUID().toString();
        this.identitySubject = identitySubject;
        this.displayName = displayName;
        this.headline = headline;
    }

    @PrePersist
    void beforeInsert() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void beforeUpdate() {
        updatedAt = Instant.now();
    }

    public void update(String displayName, String headline) {
        this.displayName = displayName;
        this.headline = headline;
    }

    public String getId() {
        return id;
    }

    public String getIdentitySubject() {
        return identitySubject;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getHeadline() {
        return headline;
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