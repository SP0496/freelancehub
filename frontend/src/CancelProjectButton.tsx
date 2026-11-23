import { useRef, useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
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
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg" role="status">
                <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                Project cancelled.
            </p>
        )
    }

    return (
        <div className="mt-3">
            {confirming ? (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 space-y-3">
                    <p className="text-xs leading-relaxed flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Cancel this project? It will stop accepting proposals and cannot be reopened.</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-all disabled:opacity-60"
                            disabled={submitting}
                            onClick={() => void cancelProject()}
                        >
                            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                            {submitting ? 'Cancelling…' : 'Confirm cancellation'}
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
                            Keep project open
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                    onClick={() => setConfirming(true)}
                >
                    Cancel project
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
