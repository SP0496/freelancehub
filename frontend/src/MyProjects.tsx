import { useEffect, useState } from 'react'
import { getJson } from './api'
import ProjectProposals from './ProjectProposals'
import CompleteProjectButton from './CompleteProjectButton'
import CancelProjectButton from './CancelProjectButton'

type Project = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
    version: number
}

type ProjectPage = {
    projects: Project[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

type MyProjectsProps = {
    onChanged?: () => void
}

export default function MyProjects({ onChanged }: MyProjectsProps) {
    const [page, setPage] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [data, setData] = useState<ProjectPage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedProject, setSelectedProject] =
        useState<Project | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProjects() {
            setLoading(true)
            setError('')
            setData(null)

            try {
                const result = await getJson<ProjectPage>(
                    `/api/v1/projects/mine?page=${page}&size=5`,
                    controller.signal,
                )

                if (!controller.signal.aborted) {
                    setData(result)
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'Unable to load your projects.',
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProjects()

        return () => controller.abort()
    }, [page, attempt])

    function handleProjectChanged() {
        setAttempt((value) => value + 1)
        onChanged?.()
    }

    function returnToProjects() {
        setSelectedProject(null)
        handleProjectChanged()
    }

    if (selectedProject) {
        return (
            <div id="my-projects" className="projects-section">
                <ProjectProposals
                    key={selectedProject.id}
                    projectId={selectedProject.id}
                    projectTitle={selectedProject.title}
                    currency={selectedProject.currency}
                    onBack={returnToProjects}
                />
            </div>
        )
    }

    return (
        <section
            id="my-projects"
            className="projects-section"
            aria-labelledby="my-projects-title"
            aria-busy={loading}
        >
            <div className="projects-heading">
                <div>
                    <p className="eyebrow">THE WORK YOU STARTED</p>
                    <h2 id="my-projects-title">My projects</h2>
                </div>

                <button
                    className="secondary-button"
                    type="button"
                    disabled={loading}
                    onClick={() => setAttempt((value) => value + 1)}
                >
                    Refresh
                </button>
            </div>

            {loading && (
                <p className="projects-message" role="status">
                    Loading your projects…
                </p>
            )}

            {error && (
                <div className="projects-message">
                    <p className="projects-error" role="alert">
                        {error}
                    </p>

                    <button
                        className="secondary-button"
                        type="button"
                        onClick={() => setAttempt((value) => value + 1)}
                    >
                        Try again
                    </button>
                </div>
            )}

            {data && data.projects.length === 0 && (
                <div className="projects-message">
                    <h3>No projects on this page</h3>
                    <p>Projects you create will appear here.</p>

                    {page > 0 && (
                        <button
                            className="secondary-button"
                            type="button"
                            onClick={() => setPage(0)}
                        >
                            Back to first page
                        </button>
                    )}
                </div>
            )}

            {data && data.projects.length > 0 && (
                <ul className="project-list">
                    {data.projects.map((project) => (
                        <li className="project-row" key={project.id}>
                            <div className="project-summary">
                <span className="project-status">
                  {project.status.replaceAll('_', ' ')}
                </span>

                                <h3>{project.title}</h3>
                                <p>{project.description}</p>

                                <button
                                    className="secondary-button project-proposals-button"
                                    type="button"
                                    onClick={() => setSelectedProject(project)}
                                >
                                    View proposals
                                </button>

                                {project.status === 'OPEN' && (
                                    <CancelProjectButton
                                        projectId={project.id}
                                        projectVersion={project.version}
                                        onCancelled={handleProjectChanged}
                                    />
                                )}

                                {project.status === 'IN_PROGRESS' && (
                                    <CompleteProjectButton
                                        projectId={project.id}
                                        projectVersion={project.version}
                                        onCompleted={handleProjectChanged}
                                    />
                                )}
                            </div>

                            <div className="project-budget">
                                <span>Project budget</span>

                                <strong>
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: project.currency,
                                        maximumFractionDigits: 2,
                                    }).format(project.budget)}
                                </strong>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalPages > 0 && (
                <nav className="pagination" aria-label="My project pages">
                    <button
                        className="secondary-button"
                        type="button"
                        disabled={page === 0}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        Previous
                    </button>

                    <span aria-live="polite">
            Page {data.page + 1} of {data.totalPages}
          </span>

                    <button
                        className="secondary-button"
                        type="button"
                        disabled={data.last}
                        onClick={() => setPage((value) => value + 1)}
                    >
                        Next
                    </button>
                </nav>
            )}
        </section>
    )
}