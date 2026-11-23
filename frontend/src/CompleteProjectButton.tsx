import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle, CheckCircle2, Loader2 } from 'lucide-react'
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
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200" role="status">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                Project completed.
            </p>
        )
    }

    return (
        <div className="mt-3">
            {confirming ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-950 space-y-3">
                    <p className="text-xs leading-relaxed flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Confirm that all work is completed? This project cannot be reopened once completed.</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-60"
                            disabled={submitting}
                            onClick={() => void completeProject()}
                        >
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {submitting ? 'Completing…' : 'Confirm completion'}
                        </button>

                        <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all disabled:opacity-60"
                            disabled={submitting}
                            onClick={() => {
                                setConfirming(false)
                                setError('')
                            }}
                        >
                            Keep in progress
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
                    onClick={() => setConfirming(true)}
                >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark as completed
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
