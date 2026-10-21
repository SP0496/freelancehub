import { useEffect, useState } from 'react'
import { getJson } from './api'
import AcceptProposalButton from './AcceptProposalButton'

type Proposal = {
    id: string
    coverLetter: string
    proposedAmount: number
    deliveryDays: number
    status: string
    version: number
}

type ProposalPage = {
    proposals: Proposal[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

type ProjectProposalsProps = {
    projectId: string
    projectTitle: string
    currency: string
    onBack: () => void
}

export default function ProjectProposals({
                                             projectId,
                                             projectTitle,
                                             currency,
                                             onBack,
                                         }: ProjectProposalsProps) {
    const [page, setPage] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [data, setData] = useState<ProposalPage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const controller = new AbortController()

        async function loadProposals() {
            setLoading(true)
            setError('')
            setData(null)

            try {
                const result = await getJson<ProposalPage>(
                    `/api/v1/projects/${encodeURIComponent(projectId)}/proposals?page=${page}&size=5`,
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
                            : 'Unable to load proposals.',
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProposals()

        return () => controller.abort()
    }, [projectId, page, attempt])

    return (
        <section
            aria-labelledby="received-proposals-title"
            aria-busy={loading}
        >
            <button
                className="secondary-button"
                type="button"
                onClick={onBack}
            >
                ← Back to my projects
            </button>

            <div className="project-detail-content">
                <p className="eyebrow">RECEIVED PROPOSALS</p>
                <h2 id="received-proposals-title">{projectTitle}</h2>

                <div className="projects-heading">
                    <p className="hero-note">
                        Review the approach, price, and delivery time.
                    </p>

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
                        Loading proposals…
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

                {data && data.proposals.length === 0 && (
                    <div className="projects-message">
                        <h3>No proposals on this page</h3>
                        <p>Applications for this project will appear here.</p>

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

                {data && data.proposals.length > 0 && (
                    <ul className="project-list">
                        {data.proposals.map((proposal) => (
                            <li className="project-row" key={proposal.id}>
                                <div className="project-summary">
                  <span className="project-status">
                    {proposal.status.replaceAll('_', ' ')}
                  </span>

                                    <h3>
                                        Delivery in {proposal.deliveryDays}{' '}
                                        {proposal.deliveryDays === 1 ? 'day' : 'days'}
                                    </h3>

                                    <div className="project-detail-description">
                                        {proposal.coverLetter}
                                    </div>

                                    {proposal.status === 'SUBMITTED' && (
                                        <AcceptProposalButton
                                            projectId={projectId}
                                            proposalId={proposal.id}
                                            proposalVersion={proposal.version}
                                            onAccepted={() =>
                                                setAttempt((value) => value + 1)
                                            }
                                        />
                                    )}
                                </div>

                                <div className="project-budget">
                                    <span>Proposed price</span>

                                    <strong>
                                        {new Intl.NumberFormat('en-IN', {
                                            style: 'currency',
                                            currency,
                                            maximumFractionDigits: 2,
                                        }).format(proposal.proposedAmount)}
                                    </strong>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {data && data.totalPages > 0 && (
                    <nav
                        className="pagination"
                        aria-label="Received proposal pages"
                    >
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
            </div>
        </section>
    )
}