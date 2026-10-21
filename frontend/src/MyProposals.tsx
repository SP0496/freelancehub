import { useEffect, useState } from 'react'
import { getJson } from './api'
import WithdrawProposalButton from './WithdrawProposalButton'

type Proposal = {
    id: string
    projectId: string
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

export default function MyProposals() {
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
                    `/api/v1/proposals/mine?page=${page}&size=5`,
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
                            : 'Unable to load your proposals.',
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
    }, [page, attempt])

    return (
        <section
            id="my-proposals"
            className="projects-section"
            aria-labelledby="my-proposals-title"
            aria-busy={loading}
        >
            <div className="projects-heading">
                <div>
                    <p className="eyebrow">YOUR APPLICATIONS</p>
                    <h2 id="my-proposals-title">My proposals</h2>
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
                    Loading your proposals…
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
                    <p>Your submitted proposals will appear here.</p>

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

                                <p>{proposal.coverLetter}</p>

                                {proposal.status === 'SUBMITTED' && (
                                    <WithdrawProposalButton
                                        projectId={proposal.projectId}
                                        proposalId={proposal.id}
                                        proposalVersion={proposal.version}
                                        onWithdrawn={() =>
                                            setAttempt((value) => value + 1)
                                        }
                                    />
                                )}
                            </div>

                            <div className="project-budget">
                                <span>Proposed amount</span>

                                <strong>
                                    {new Intl.NumberFormat('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(proposal.proposedAmount)}
                                </strong>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalPages > 0 && (
                <nav className="pagination" aria-label="Proposal pages">
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