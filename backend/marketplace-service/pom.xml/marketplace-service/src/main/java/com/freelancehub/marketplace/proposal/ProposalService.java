package com.freelancehub.marketplace.proposal;

import com.freelancehub.marketplace.project.ProjectEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Objects;

@Service
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final EntityManager entityManager;

    public ProposalService(
            ProposalRepository proposalRepository,
            EntityManager entityManager) {

        this.proposalRepository = proposalRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public ProposalResponse createProposal(
            String projectId,
            String freelancerSubject,
            CreateProposalRequest request) {

        ProjectEntity project = entityManager.find(
                ProjectEntity.class,
                projectId,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (project == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        if (project.getClientSubject().equals(freelancerSubject)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot apply to your own project"
            );
        }

        if (!"OPEN".equals(project.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Proposals are allowed only for OPEN projects"
            );
        }

        boolean alreadySubmitted =
                proposalRepository.existsByProjectIdAndFreelancerSubject(
                        projectId,
                        freelancerSubject
                );

        if (alreadySubmitted) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already submitted a proposal for this project"
            );
        }

        ProposalEntity proposal = new ProposalEntity(
                projectId,
                freelancerSubject,
                request.coverLetter().strip(),
                request.proposedAmount(),
                request.deliveryDays()
        );

        try {
            ProposalEntity saved =
                    proposalRepository.saveAndFlush(proposal);

            return ProposalResponse.from(saved);
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Proposal could not be saved. Reload and try again.",
                    exception
            );
        }
    }

    @Transactional(readOnly = true)
    public ProposalPageResponse getProjectProposals(
            String projectId,
            String clientSubject,
            int page,
            int size) {

        PageRequest pageRequest = createPageRequest(page, size);

        ProjectEntity project = entityManager.find(
                ProjectEntity.class,
                projectId
        );

        if (project == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        if (!project.getClientSubject().equals(clientSubject)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can view proposals only for your own projects"
            );
        }

        Page<ProposalEntity> result =
                proposalRepository.findByProjectId(
                        projectId,
                        pageRequest
                );

        return toPageResponse(result);
    }

    @Transactional(readOnly = true)
    public ProposalPageResponse getMyProposals(
            String freelancerSubject,
            int page,
            int size) {

        PageRequest pageRequest = createPageRequest(page, size);

        Page<ProposalEntity> result =
                proposalRepository.findByFreelancerSubject(
                        freelancerSubject,
                        pageRequest
                );

        return toPageResponse(result);
    }

    @Transactional
    public ProposalResponse acceptProposal(
            String projectId,
            String proposalId,
            String clientSubject,
            AcceptProposalRequest request) {

        ProjectEntity project = entityManager.find(
                ProjectEntity.class,
                projectId,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (project == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        if (!project.getClientSubject().equals(clientSubject)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can accept proposals only for your own projects"
            );
        }

        if (!"OPEN".equals(project.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only OPEN projects can accept a proposal"
            );
        }

        ProposalEntity proposal = entityManager.find(
                ProposalEntity.class,
                proposalId,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (proposal == null
                || !projectId.equals(proposal.getProjectId())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Proposal not found for this project"
            );
        }

        if (!"SUBMITTED".equals(proposal.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only SUBMITTED proposals can be accepted"
            );
        }

        if (!Objects.equals(
                project.getVersion(), request.projectVersion())
                || !Objects.equals(
                proposal.getVersion(), request.proposalVersion())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project or proposal changed. Reload before accepting."
            );
        }

        var submittedProposals =
                proposalRepository.findByProjectIdAndStatus(
                        projectId,
                        "SUBMITTED"
                );

        for (ProposalEntity other : submittedProposals) {
            if (!other.getId().equals(proposalId)) {
                other.reject();
            }
        }

        proposal.accept();
        project.startWork();

        try {
            proposalRepository.flush();
            return ProposalResponse.from(proposal);
        } catch (OptimisticLockingFailureException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project or proposal changed. Reload before accepting.",
                    exception
            );
        }
    }

    @Transactional
    public ProposalResponse withdrawProposal(
            String projectId,
            String proposalId,
            String freelancerSubject,
            WithdrawProposalRequest request) {

        ProjectEntity project = entityManager.find(
                ProjectEntity.class,
                projectId,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (project == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Project not found"
            );
        }

        ProposalEntity proposal = entityManager.find(
                ProposalEntity.class,
                proposalId,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (proposal == null
                || !projectId.equals(proposal.getProjectId())) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Proposal not found for this project"
            );
        }

        if (!proposal.getFreelancerSubject().equals(freelancerSubject)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can withdraw only your own proposals"
            );
        }

        if (!"SUBMITTED".equals(proposal.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only SUBMITTED proposals can be withdrawn"
            );
        }

        if (!Objects.equals(proposal.getVersion(), request.version())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Proposal changed. Reload before withdrawing."
            );
        }

        proposal.withdraw();

        try {
            proposalRepository.flush();
            return ProposalResponse.from(proposal);
        } catch (OptimisticLockingFailureException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Proposal changed. Reload before withdrawing.",
                    exception
            );
        }
    }

    private PageRequest createPageRequest(int page, int size) {

        if (page < 0 || size < 1 || size > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be 0 or greater. Size must be between 1 and 50."
            );
        }

        return PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")
                )
        );
    }

    private ProposalPageResponse toPageResponse(
            Page<ProposalEntity> result) {

        return new ProposalPageResponse(
                result.getContent()
                        .stream()
                        .map(ProposalResponse::from)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }
}