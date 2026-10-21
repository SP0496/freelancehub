package com.freelancehub.marketplace.proposal;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProposalRepository
        extends JpaRepository<ProposalEntity, String> {

    boolean existsByProjectIdAndFreelancerSubject(
            String projectId,
            String freelancerSubject);

    Page<ProposalEntity> findByProjectId(
            String projectId,
            Pageable pageable);

    Page<ProposalEntity> findByFreelancerSubject(
            String freelancerSubject,
            Pageable pageable);

    List<ProposalEntity> findByProjectIdAndStatus(
            String projectId,
            String status);
}