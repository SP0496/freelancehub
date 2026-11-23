import { useEffect, useState } from 'react'
import { ArrowLeft, Briefcase, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
import { getJson } from './api'
import ProposalForm from './ProposalForm'

type Project = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
}

type ProjectDetailsProps = {
    projectId: string
    onBack: () => void
}

export default function ProjectDetails({
    projectId,
    onBack,
}: ProjectDetailsProps) {
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProject() {
            setLoading(true)
            setError('')
            setProject(null)

            try {
                const result = await getJson<Project>(
                    `/api/v1/projects/${encodeURIComponent(projectId)}`,
                    controller.signal,
                )

                if (!controller.signal.aborted) {
                    setProject(result)
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'Unable to load this project.',
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProject()

        return () => controller.abort()
    }, [projectId, attempt])

    return (
        <section
            className="max-w-3xl mx-auto py-4"
            aria-label="Project details"
            aria-busy={loading}
        >
            <button
                className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                type="button"
                onClick={onBack}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to projects
            </button>

            {loading && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3" role="status">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium">Loading project brief…</p>
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
                            onClick={() => setAttempt((current) => current + 1)}
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {project && (
                <article className="space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-100">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Briefcase className="w-3.5 h-3.5" />
                                {project.status.replaceAll('_', ' ')}
                            </span>

                            <div className="text-right">
                                <span className="block text-xs font-medium text-slate-400">Budget</span>
                                <span className="text-xl font-black font-heading text-slate-900">
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: project.currency,
                                        maximumFractionDigits: 2,
                                    }).format(project.budget)}
                                </span>
                            </div>
                        </div>

                        <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-6 leading-tight">
                            {project.title}
                        </h2>

                        <div className="mt-6">
                            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-2">
                                Scope & Requirements
                            </h3>
                            <div className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                                {project.description}
                            </div>
                        </div>
                    </div>

                    {project.status === 'OPEN' ? (
                        <ProposalForm
                            key={project.id}
                            projectId={project.id}
                            currency={project.currency}
                        />
                    ) : (
                        <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200 text-center text-slate-500 text-sm">
                            This project is no longer accepting proposals.
                        </div>
                    )}
                </article>
            )}
        </section>
    )
}
