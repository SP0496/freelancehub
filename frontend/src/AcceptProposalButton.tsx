import { useRef, useState } from 'react'
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
            <p className="project-status" role="status">
                Proposal accepted. The project is now in progress.
            </p>
        )
    }

    return (
        <div className="proposal-acceptance">
            {confirming ? (
                <>
                    <p className="hero-note">
                        Accept this proposal and start the project?
                        Other submitted proposals will be rejected.
                    </p>

                    <div className="proposal-action-buttons">
                        <button
                            className="account-button"
                            type="button"
                            disabled={submitting}
                            onClick={() => void acceptProposal()}
                        >
                            {submitting ? 'Accepting…' : 'Confirm acceptance'}
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
                            Keep reviewing
                        </button>
                    </div>
                </>
            ) : (
                <button
                    className="account-button"
                    type="button"
                    onClick={() => setConfirming(true)}
                >
                    Accept proposal
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