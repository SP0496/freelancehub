import { useRef, useState } from 'react'
import { ApiError, postJson } from './api'

type WithdrawProposalButtonProps = {
    projectId: string
    proposalId: string
    proposalVersion: number
    onWithdrawn: () => void
}

type WithdrawnProposal = {
    id: string
    status: string
}

export default function WithdrawProposalButton({
                                                   projectId,
                                                   proposalId,
                                                   proposalVersion,
                                                   onWithdrawn,
                                               }: WithdrawProposalButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [withdrawn, setWithdrawn] = useState(false)
    const [error, setError] = useState('')

    const submissionInProgress = useRef(false)

    async function withdrawProposal() {
        if (submissionInProgress.current || withdrawn) {
            return
        }

        submissionInProgress.current = true
        setSubmitting(true)
        setError('')

        try {
            await postJson<WithdrawnProposal>(
                `/api/v1/projects/${encodeURIComponent(projectId)}/proposals/${encodeURIComponent(proposalId)}/withdraw`,
                {
                    version: proposalVersion,
                },
            )
        } catch (failure) {
            setError(
                failure instanceof ApiError
                    ? failure.message
                    : 'Could not confirm withdrawal. Refresh your proposals before trying again.',
            )

            return
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }

        setWithdrawn(true)
        setConfirming(false)
        onWithdrawn()
    }

    if (withdrawn) {
        return (
            <p className="project-status" role="status">
                Proposal withdrawn.
            </p>
        )
    }

    return (
        <div className="proposal-acceptance">
            {confirming ? (
                <>
                    <p className="hero-note">
                        Withdraw this proposal? You will not be able to submit
                        another proposal for the same project.
                    </p>

                    <div className="proposal-action-buttons">
                        <button
                            className="secondary-button"
                            type="button"
                            disabled={submitting}
                            onClick={() => void withdrawProposal()}
                        >
                            {submitting ? 'Withdrawing…' : 'Confirm withdrawal'}
                        </button>

                        <button
                            className="secondary-button"
                            type="button"
                            disabled={submitting}
                            onClick={() => {
                                setConfirming(false)
                                setError('')
                            }}
                        >
                            Keep proposal
                        </button>
                    </div>
                </>
            ) : (
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setConfirming(true)}
                >
                    Withdraw proposal
                </button>
            )}

            {error && (
                <p className="projects-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    )
}