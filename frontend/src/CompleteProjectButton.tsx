import { useRef, useState } from 'react'
import { ApiError, postJson } from './api'

type CompleteProjectButtonProps = {
    projectId: string
    projectVersion: number
    onCompleted: () => void
}

type CompletedProject = {
    id: string
    status: string
}

export default function CompleteProjectButton({
                                                  projectId,
                                                  projectVersion,
                                                  onCompleted,
                                              }: CompleteProjectButtonProps) {
    const [confirming, setConfirming] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [error, setError] = useState('')

    const submissionInProgress = useRef(false)

    async function completeProject() {
        if (submissionInProgress.current || completed) {
            return
        }

        submissionInProgress.current = true
        setSubmitting(true)
        setError('')

        try {
            await postJson<CompletedProject>(
                `/api/v1/projects/${encodeURIComponent(projectId)}/complete`,
                {
                    version: projectVersion,
                },
            )
        } catch (failure) {
            setError(
                failure instanceof ApiError
                    ? failure.message
                    : 'Could not confirm completion. Refresh your projects before trying again.',
            )

            return
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }

        setCompleted(true)
        setConfirming(false)
        onCompleted()
    }

    if (completed) {
        return (
            <p className="project-status" role="status">
                Project completed.
            </p>
        )
    }

    return (
        <div className="proposal-acceptance">
            {confirming ? (
                <>
                    <p className="hero-note">
                        Confirm that the work is finished. This project cannot
                        be reopened through the application.
                    </p>

                    <div className="proposal-action-buttons">
                        <button
                            className="account-button"
                            type="button"
                            disabled={submitting}
                            onClick={() => void completeProject()}
                        >
                            {submitting ? 'Completing…' : 'Confirm completion'}
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
                            Keep in progress
                        </button>
                    </div>
                </>
            ) : (
                <button
                    className="account-button"
                    type="button"
                    onClick={() => setConfirming(true)}
                >
                    Mark as completed
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