import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle, Check, Loader2 } from 'lucide-react'
import { ApiError, getJson, postJson } from './api'

type AcceptProposalButtonProps = {
    projectId: string
    proposalId: string
    proposalVersion: number
    onAccepted: () => void
}

type ProjectVersion = {
    version: number
}

type AcceptedProposal = {
    id: string
    status: string
}

export default function AcceptProposalButton({
    projectId,
    proposalId,
    proposalVersion,
    onAccepted,
}: AcceptProposalButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [accepted, setAccepted] = useState(false)
    const [error, setError] = useState('')

    const submissionInProgress = useRef(false)

    async function acceptProposal() {
        if (submissionInProgress.current || accepted) {
            return
        }

        submissionInProgress.current = true
        setSubmitting(true)
        setError('')

        try {
            const project = await getJson<ProjectVersion>(
                `/api/v1/projects/${encodeURIComponent(projectId)}`,
            )

            await postJson<AcceptedProposal>(
                `/api/v1/projects/${encodeURIComponent(projectId)}/proposals/${encodeURIComponent(proposalId)}/accept`,
                {
                    projectVersion: project.version,
                    proposalVersion,
                },
            )
        } catch (failure) {
            setError(
                failure instanceof ApiError
                    ? failure.message
                    : 'Could not confirm acceptance. Refresh the proposals before trying again.',
            )
            return
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }

        setAccepted(true)
        setConfirming(false)
        onAccepted()
    }

    if (accepted) {
        return (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200" role="status">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Proposal accepted. The project is now in progress.
            </p>
        )
    }

    return (
        <div className="mt-3">
            {confirming ? (
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-3">
                    <p className="text-xs leading-relaxed text-emerald-800">
                        Accept this proposal and start the project? Other submitted proposals will automatically be rejected.
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-60"
                            disabled={submitting}
                            onClick={() => void acceptProposal()}
                        >
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {submitting ? 'Accepting…' : 'Confirm acceptance'}
                        </button>

                        <button
                            type="button"
                            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all disabled:opacity-60"
                            disabled={submitting}
                            onClick={() => {
                                setConfirming(false)
                                setError('')
                            }}
                        >
                            Keep reviewing
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 transition-all"
                    onClick={() => setConfirming(true)}
                >
                    <Check className="w-3.5 h-3.5" />
                    Accept proposal
                </button>
            )}

            {error && (
                <p className="mt-2 text-xs font-medium text-rose-600 flex items-center gap-1.5" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
        </div>
    )
}
