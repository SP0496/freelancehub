package com.freelancehub.marketplace.project;

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
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional
    public ProjectResponse createProject(
            String clientSubject,
            CreateProjectRequest request) {

        ProjectEntity project = new ProjectEntity(
                clientSubject,
                request.title().strip(),
                request.description().strip(),
                request.budget()
        );

        ProjectEntity saved = projectRepository.saveAndFlush(project);

        return ProjectResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(String id) {

        ProjectEntity project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found"
                ));

        return ProjectResponse.from(project);
    }

    @Transactional(readOnly = true)
    public ProjectPageResponse getOpenProjects(int page, int size) {

        PageRequest pageRequest = createPageRequest(page, size);

        Page<ProjectEntity> result =
                projectRepository.findByStatus("OPEN", pageRequest);

        return toPageResponse(result);
    }

    @Transactional(readOnly = true)
    public ProjectPageResponse getMyProjects(
            String clientSubject, int page, int size) {

        PageRequest pageRequest = createPageRequest(page, size);

        Page<ProjectEntity> result =
                projectRepository.findByClientSubject(
                        clientSubject, pageRequest);

        return toPageResponse(result);
    }

    @Transactional
    public ProjectResponse updateProject(
            String id,
            String clientSubject,
            UpdateProjectRequest request) {

        ProjectEntity project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Project not found"
                ));

        if (!project.getClientSubject().equals(clientSubject)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can edit only your own projects"
            );
        }

        if (!"OPEN".equals(project.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only OPEN projects can be edited"
            );
        }

        if (!Objects.equals(project.getVersion(), request.version())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project changed. Reload it before editing."
            );
        }

        project.updateDetails(
                request.title().strip(),
                request.description().strip(),
                request.budget()
        );

        try {
            projectRepository.flush();
            return ProjectResponse.from(project);
        } catch (OptimisticLockingFailureException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Project changed. Reload it before editing.",
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

    private ProjectPageResponse toPageResponse(
            Page<ProjectEntity> result) {

        return new ProjectPageResponse(
                result.getContent()
                        .stream()
                        .map(ProjectResponse::from)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }
}