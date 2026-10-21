package com.freelancehub.marketplace.proposal;

import com.freelancehub.marketplace.project.ProjectEntity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class ProposalServiceTest {

    private ProposalRepository repository;
    private EntityManager entityManager;
    private ProposalService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProposalRepository.class);
        entityManager = mock(EntityManager.class);
        service = new ProposalService(repository, entityManager);
    }

    @Test
    void ownerCannotApplyToOwnProject() {
        ProjectEntity project = new ProjectEntity(
                "satish-subject",
                "Build a website",
                "Create a business website",
                new BigDecimal("6000.00")
        );

        when(entityManager.find(
                ProjectEntity.class,
                project.getId(),
                LockModeType.PESSIMISTIC_WRITE
        )).thenReturn(project);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.createProposal(
                        project.getId(),
                        "satish-subject",
                        validRequest()
                )
        );

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    @Test
    void cancelledProjectCannotReceiveProposal() {
        ProjectEntity project = new ProjectEntity(
                "satish-subject",
                "Build a website",
                "Create a business website",
                new BigDecimal("6000.00")
        );

        project.cancel();

        when(entityManager.find(
                ProjectEntity.class,
                project.getId(),
                LockModeType.PESSIMISTIC_WRITE
        )).thenReturn(project);

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.createProposal(
                        project.getId(),
                        "ravi-subject",
                        validRequest()
                )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verifyNoInteractions(repository);
    }

    private CreateProposalRequest validRequest() {
        return new CreateProposalRequest(
                "I can build this website.",
                new BigDecimal("4500.00"),
                7
        );
    }
}