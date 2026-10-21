package com.freelancehub.marketplace.proposal;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/proposals")
public class ProposalController {

    private final ProposalService proposalService;

    public ProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProposalResponse createProposal(
            @PathVariable("projectId") String projectId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateProposalRequest request) {

        return proposalService.createProposal(
                projectId,
                jwt.getSubject(),
                request
        );
    }

    @GetMapping
    public ProposalPageResponse getProjectProposals(
            @PathVariable("projectId") String projectId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return proposalService.getProjectProposals(
                projectId,
                jwt.getSubject(),
                page,
                size
        );
    }

    @PostMapping("/{proposalId}/accept")
    public ProposalResponse acceptProposal(
            @PathVariable("projectId") String projectId,
            @PathVariable("proposalId") String proposalId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody AcceptProposalRequest request) {

        return proposalService.acceptProposal(
                projectId,
                proposalId,
                jwt.getSubject(),
                request
        );
    }

    @PostMapping("/{proposalId}/withdraw")
    public ProposalResponse withdrawProposal(
            @PathVariable("projectId") String projectId,
            @PathVariable("proposalId") String proposalId,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody WithdrawProposalRequest request) {

        return proposalService.withdrawProposal(
                projectId,
                proposalId,
                jwt.getSubject(),
                request
        );
    }
}