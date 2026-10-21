package com.freelancehub.marketplace.proposal;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/proposals")
public class MyProposalController {

    private final ProposalService proposalService;

    public MyProposalController(ProposalService proposalService) {
        this.proposalService = proposalService;
    }

    @GetMapping("/mine")
    public ProposalPageResponse getMyProposals(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return proposalService.getMyProposals(
                jwt.getSubject(),
                page,
                size
        );
    }
}
