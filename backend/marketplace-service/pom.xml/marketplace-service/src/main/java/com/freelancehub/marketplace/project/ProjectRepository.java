package com.freelancehub.marketplace.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository
        extends JpaRepository<ProjectEntity, String> {

    Page<ProjectEntity> findByStatus(
            String status, Pageable pageable);

    Page<ProjectEntity> findByClientSubject(
            String clientSubject, Pageable pageable);
}