import { useEffect, useState } from 'react'
import { ArrowLeft, RefreshCw, Loader2, Calendar, AlertCircle, Inbox } from 'lucide-react'
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
            className="max-w-4xl mx-auto py-4"
            aria-labelledby="received-proposals-title"
            aria-busy={loading}
        >
            <button
                className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                type="button"
                onClick={onBack}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to my projects
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Received Applications
                    </span>
                    <h2 id="received-proposals-title" className="text-2xl font-bold font-heading text-slate-900 mt-2">
                        {projectTitle}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Review submissions, compare pricing, and accept the winning proposal.
                    </p>
                </div>

                <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm self-start sm:self-auto"
                    type="button"
                    disabled={loading}
                    onClick={() => setAttempt((value) => value + 1)}
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3" role="status">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium">Loading applicant proposals…</p>
                </div>
            )}

            {error && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 my-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium" role="alert">{error}</p>
                        <button
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                            type="button"
                            onClick={() => setAttempt((value) => value + 1)}
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {data && data.proposals.length === 0 && (
                <div className="text-center p-12 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto my-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                        <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No proposals yet</h3>
                    <p className="text-xs text-slate-500">
                        Applications submitted by freelancers will be shown here.
                    </p>
                </div>
            )}

            {data && data.proposals.length > 0 && (
                <ul className="space-y-4">
                    {data.proposals.map((proposal) => (
                        <li
                            key={proposal.id}
                            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                        proposal.status === 'ACCEPTED'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : proposal.status === 'REJECTED' || proposal.status === 'WITHDRAWN'
                                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                        {proposal.status.replaceAll('_', ' ')}
                                    </span>

                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                        Delivery in {proposal.deliveryDays} {proposal.deliveryDays === 1 ? 'day' : 'days'}
                                    </span>
                                </div>

                                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {proposal.coverLetter}
                                </div>

                                {proposal.status === 'SUBMITTED' && (
                                    <AcceptProposalButton
                                        projectId={projectId}
                                        proposalId={proposal.id}
                                        proposalVersion={proposal.version}
                                        onAccepted={() => setAttempt((value) => value + 1)}
                                    />
                                )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 shrink-0">
                                <span className="text-xs text-slate-400 font-medium">Proposed Price</span>
                                <span className="text-xl font-black font-heading text-slate-900">
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency,
                                        maximumFractionDigits: 2,
                                    }).format(proposal.proposedAmount)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalPages > 1 && (
                <nav className="flex items-center justify-between border-t border-slate-200 mt-8 pt-4" aria-label="Received proposal pages">
                    <button
                        type="button"
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                        disabled={page === 0}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        Previous
                    </button>

                    <span className="text-xs font-medium text-slate-500" aria-live="polite">
                        Page {data.page + 1} of {data.totalPages}
                    </span>

                    <button
                        type="button"
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
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
