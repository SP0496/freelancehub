package com.freelancehub.marketplace.project;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

        if (page < 0 || size < 1 || size > 50) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be 0 or greater. Size must be between 1 and 50."
            );
        }

        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                Sort.by(
                        Sort.Order.desc("createdAt"),
                        Sort.Order.desc("id")
                )
        );

        Page<ProjectEntity> result =
                projectRepository.findByStatus("OPEN", pageRequest);

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