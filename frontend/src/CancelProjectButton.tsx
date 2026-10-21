import { useRef, useState } from 'react'
import { ApiError, postJson } from './api'

type CancelProjectButtonProps = {
    projectId: string
    projectVersion: number
    onCancelled: () => void
}

type CancelledProject = {
    id: string
    status: string
}

export default function CancelProjectButton({
                                                projectId,
                                                projectVersion,
                                                onCancelled,
                                            }: CancelProjectButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [cancelled, setCancelled] = useState(false)
    const [error, setError] = useState('')

    const submissionInProgress = useRef(false)

    async function cancelProject() {
        if (submissionInProgress.current || cancelled) {
            return
        }

        submissionInProgress.current = true
        setSubmitting(true)
        setError('')

        try {
            await postJson<CancelledProject>(
                `/api/v1/projects/${encodeURIComponent(projectId)}/cancel`,
                {
                    version: projectVersion,
                },
            )
        } catch (failure) {
            setError(
                failure instanceof ApiError
                    ? failure.message
                    : 'Could not confirm cancellation. Refresh your projects before trying again.',
            )

            return
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }

        setCancelled(true)
        setConfirming(false)
        onCancelled()
    }

    if (cancelled) {
        return (
            <p className="project-status" role="status">
                Project cancelled.
            </p>
        )
    }

    return (
        <div className="proposal-acceptance">
            {confirming ? (
                <>
                    <p className="hero-note">
                        Cancel this project? It will stop accepting proposals
                        and cannot be reopened through the application.
                    </p>

                    <div className="proposal-action-buttons">
                        <button
                            className="secondary-button"
                            type="button"
                            disabled={submitting}
                            onClick={() => void cancelProject()}
                        >
                            {submitting ? 'Cancelling…' : 'Confirm cancellation'}
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
                            Keep project open
                        </button>
                    </div>
                </>
            ) : (
                <button
                    className="secondary-button"
                    type="button"
                    onClick={() => setConfirming(true)}
                >
                    Cancel project
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