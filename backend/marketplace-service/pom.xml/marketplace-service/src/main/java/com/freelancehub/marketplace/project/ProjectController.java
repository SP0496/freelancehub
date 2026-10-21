package com.freelancehub.marketplace.project;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse createProject(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateProjectRequest request) {

        return projectService.createProject(
                jwt.getSubject(),
                request
        );
    }

    @GetMapping("/{id}")
    public ProjectResponse getProject(
            @PathVariable("id") String id) {

        return projectService.getProject(id);
    }

    @GetMapping
    public ProjectPageResponse getOpenProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return projectService.getOpenProjects(page, size);
    }

    @GetMapping("/mine")
    public ProjectPageResponse getMyProjects(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return projectService.getMyProjects(
                jwt.getSubject(),
                page,
                size
        );
    }

    @PutMapping("/{id}")
    public ProjectResponse updateProject(
            @PathVariable("id") String id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProjectRequest request) {

        return projectService.updateProject(
                id,
                jwt.getSubject(),
                request
        );
    }

    @PostMapping("/{id}/cancel")
    public ProjectResponse cancelProject(
            @PathVariable("id") String id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CancelProjectRequest request) {

        return projectService.cancelProject(
                id,
                jwt.getSubject(),
                request
        );
    }

    @PostMapping("/{id}/complete")
    public ProjectResponse completeProject(
            @PathVariable("id") String id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CompleteProjectRequest request) {

        return projectService.completeProject(
                id,
                jwt.getSubject(),
                request
        );
    }
}