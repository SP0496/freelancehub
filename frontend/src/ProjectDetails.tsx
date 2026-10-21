import { useEffect, useState } from 'react'
import { getJson } from './api'
import ProposalForm from './ProposalForm'

type Project = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
}

type ProjectDetailsProps = {
    projectId: string
    onBack: () => void
}

export default function ProjectDetails({
                                           projectId,
                                           onBack,
                                       }: ProjectDetailsProps) {
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProject() {
            setLoading(true)
            setError('')
            setProject(null)

            try {
                const result = await getJson<Project>(
                    `/api/v1/projects/${encodeURIComponent(projectId)}`,
                    controller.signal,
                )

                if (!controller.signal.aborted) {
                    setProject(result)
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'Unable to load this project.',
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProject()

        return () => controller.abort()
    }, [projectId, attempt])

    return (
        <section
            className="project-details"
            aria-label="Project details"
            aria-busy={loading}
        >
            <button
                className="secondary-button"
                type="button"
                onClick={onBack}
            >
                ← Back to projects
            </button>

            {loading && (
                <p className="projects-message" role="status">
                    Loading project…
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
                        onClick={() => setAttempt((current) => current + 1)}
                    >
                        Try again
                    </button>
                </div>
            )}

            {project && (
                <article className="project-detail-content">
                    <p className="eyebrow">
                        {project.status.replaceAll('_', ' ')}
                    </p>

                    <h2>{project.title}</h2>

                    <div className="project-detail-budget">
                        <span>Project budget</span>

                        <strong>
                            {new Intl.NumberFormat('en-IN', {
                                style: 'currency',
                                currency: project.currency,
                                maximumFractionDigits: 2,
                            }).format(project.budget)}
                        </strong>
                    </div>

                    <h3>About this project</h3>

                    <p className="project-detail-description">
                        {project.description}
                    </p>

                    {project.status === 'OPEN' ? (
                        <ProposalForm
                            key={project.id}
                            projectId={project.id}
                            currency={project.currency}
                        />
                    ) : (
                        <p className="projects-message">
                            This project is no longer accepting proposals.
                        </p>
                    )}
                </article>
            )}
        </section>
    )
}