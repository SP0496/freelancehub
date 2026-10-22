package com.freelancehub.marketplace.proposal;

import com.freelancehub.marketplace.project.ProjectEntity;
import com.freelancehub.marketplace.security.SecurityConfig;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request
        .SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request
        .MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request
        .MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result
        .MockMvcResultMatchers.status;

@WebMvcTest(ProposalController.class)
@Import({SecurityConfig.class, ProposalService.class})
class ProposalApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProposalRepository proposalRepository;

    @MockitoBean
    private EntityManager entityManager;

    @MockitoBean
    private JwtDecoder jwtDecoder;

    @Test
    void signedOutUserCannotViewProposals() throws Exception {
        mockMvc.perform(
                get("/api/v1/projects/project-123/proposals")
        ).andExpect(status().isUnauthorized());

        verifyNoInteractions(entityManager, proposalRepository);
    }

    @Test
    void anotherClientCannotAcceptProposal() throws Exception {
        ProjectEntity project = mock(ProjectEntity.class);

        when(project.getClientSubject()).thenReturn("project-owner");

        when(entityManager.find(
                ProjectEntity.class,
                "project-123",
                LockModeType.PESSIMISTIC_WRITE
        )).thenReturn(project);

        mockMvc.perform(
                post(
                        "/api/v1/projects/project-123"
                                + "/proposals/proposal-456/accept"
                )
                        .with(jwt().jwt(token ->
                                token.subject("another-client")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "projectVersion": 0,
                                  "proposalVersion": 0
                                }
                                """)
        ).andExpect(status().isForbidden());

        // Confirm that the real service checked project ownership.
        verify(project).getClientSubject();

        // No proposal should be loaded or changed after rejection.
        verify(entityManager, never()).find(
                ProposalEntity.class,
                "proposal-456",
                LockModeType.PESSIMISTIC_WRITE
        );

        verify(project, never()).startWork();
        verifyNoInteractions(proposalRepository);
    }

    @Test
    void anotherFreelancerCannotWithdrawProposal() throws Exception {
        ProjectEntity project = mock(ProjectEntity.class);
        ProposalEntity proposal = mock(ProposalEntity.class);

        when(entityManager.find(
                ProjectEntity.class,
                "project-123",
                LockModeType.PESSIMISTIC_WRITE
        )).thenReturn(project);

        when(entityManager.find(
                ProposalEntity.class,
                "proposal-456",
                LockModeType.PESSIMISTIC_WRITE
        )).thenReturn(proposal);

        when(proposal.getProjectId()).thenReturn("project-123");
        when(proposal.getFreelancerSubject())
                .thenReturn("proposal-owner");

        mockMvc.perform(
                post(
                        "/api/v1/projects/project-123"
                                + "/proposals/proposal-456/withdraw"
                )
                        .with(jwt().jwt(token ->
                                token.subject("another-freelancer")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "version": 0
                                }
                                """)
        ).andExpect(status().isForbidden());

        // Confirm that the real service checked proposal ownership.
        verify(proposal).getFreelancerSubject();

        verify(proposal, never()).withdraw();
        verifyNoInteractions(proposalRepository);
    }
}