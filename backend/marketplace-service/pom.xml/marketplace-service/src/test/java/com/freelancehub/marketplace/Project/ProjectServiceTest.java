package com.freelancehub.marketplace.project;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    private ProjectRepository repository;
    private ProjectService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProjectRepository.class);
        service = new ProjectService(repository);
    }

    @Test
    void anotherUserCannotEditProject() {
        ProjectEntity project = new ProjectEntity(
                "satish-subject",
                "Build a website",
                "Create a business website",
                new BigDecimal("6000.00")
        );

        when(repository.findById(project.getId()))
                .thenReturn(Optional.of(project));

        UpdateProjectRequest request = new UpdateProjectRequest(
                "Changed title",
                "Changed description",
                new BigDecimal("7000.00"),
                0L
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.updateProject(
                        project.getId(),
                        "ravi-subject",
                        request
                )
        );

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        assertEquals("Build a website", project.getTitle());
        assertEquals(new BigDecimal("6000.00"), project.getBudget());

        verify(repository, never()).flush();
    }

    @Test
    void openProjectCannotBeCompleted() {
        ProjectEntity project = new ProjectEntity(
                "satish-subject",
                "Build a website",
                "Create a business website",
                new BigDecimal("6000.00")
        );

        when(repository.findById(project.getId()))
                .thenReturn(Optional.of(project));

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.completeProject(
                        project.getId(),
                        "satish-subject",
                        new CompleteProjectRequest(0L)
                )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals("OPEN", project.getStatus());

        verify(repository, never()).flush();
    }

    @Test
    void outdatedVersionCannotUpdateProject() {
        ProjectEntity project = mock(ProjectEntity.class);

        when(repository.findById("project-1"))
                .thenReturn(Optional.of(project));

        when(project.getClientSubject()).thenReturn("satish-subject");
        when(project.getStatus()).thenReturn("OPEN");
        when(project.getVersion()).thenReturn(2L);

        UpdateProjectRequest request = new UpdateProjectRequest(
                "Updated title",
                "Updated description",
                new BigDecimal("7000.00"),
                1L
        );

        ResponseStatusException error = assertThrows(
                ResponseStatusException.class,
                () -> service.updateProject(
                        "project-1",
                        "satish-subject",
                        request
                )
        );

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());

        verify(project, never()).updateDetails(
                anyString(),
                anyString(),
                any(BigDecimal.class)
        );

        verify(repository, never()).flush();
    }
}