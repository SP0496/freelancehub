import { useEffect, useState } from 'react'
import { getJson } from './api'
import ProjectDetails from './ProjectDetails'

type Project = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
}

type ProjectPage = {
    projects: Project[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

export default function OpenProjects() {
    const [page, setPage] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [data, setData] = useState<ProjectPage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<
        string | null
    >(null)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProjects() {
            setLoading(true)
            setError('')
            setData(null)

            try {
                const result = await getJson<ProjectPage>(
                    `/api/v1/projects?page=${page}&size=5`,
                    controller.signal,
                )

                if (!controller.signal.aborted) {
                    setData(result)
                }
            } catch (failure) {
                if (controller.signal.aborted) return

                setError(
                    failure instanceof Error
                        ? failure.message
                        : 'Unable to load projects. Please try again.',
                )
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProjects()

        return () => controller.abort()
    }, [page, attempt])

    if (selectedProjectId !== null) {
        return (
            <div id="projects" className="projects-section">
                <ProjectDetails
                    projectId={selectedProjectId}
                    onBack={() => setSelectedProjectId(null)}
                />
            </div>
        )
    }

    return (
        <section
            id="projects"
            className="projects-section"
            aria-labelledby="projects-title"
            aria-busy={loading}
        >
            <div className="projects-heading">
                <div>
                    <p className="eyebrow">FIND YOUR NEXT OPPORTUNITY</p>
                    <h2 id="projects-title">Open projects</h2>
                </div>

                {data && (
                    <span className="project-count">
            {data.totalElements}{' '}
                        {data.totalElements === 1 ? 'project' : 'projects'}
          </span>
                )}
            </div>

            {loading && (
                <p className="projects-message" role="status">
                    Loading projects…
                </p>
            )}

            {error && (
                <div className="projects-message">
                    <p className="projects-error" role="alert">
                        {error}
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setAttempt((value) => value + 1)}
                    >
                        Try again
                    </button>
                </div>
            )}

            {data && data.projects.length === 0 && (
                <div className="projects-message">
                    <h3>No open projects on this page</h3>
                    <p>
                        New opportunities will appear here when clients post projects.
                    </p>

                    {page > 0 && (
                        <button
                            type="button"
                            className="secondary-button"
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
                        <li key={project.id} className="project-row">
                            <div className="project-summary">
                <span className="project-status">
                  Open for proposals
                </span>

                                <h3>
                                    <button
                                        type="button"
                                        className="project-title-button"
                                        onClick={() => setSelectedProjectId(project.id)}
                                    >
                                        {project.title}
                                        <span aria-hidden="true"> ↗</span>
                                    </button>
                                </h3>

                                <p>{project.description}</p>
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
                <nav className="pagination" aria-label="Project pages">
                    <button
                        type="button"
                        className="secondary-button"
                        disabled={page === 0}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        Previous
                    </button>

                    <span aria-live="polite">
            Page {data.page + 1} of {data.totalPages}
          </span>

                    <button
                        type="button"
                        className="secondary-button"
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