import { useEffect, useState } from 'react'
import { Briefcase, ArrowUpRight, ChevronLeft, ChevronRight, Loader2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { getJson } from './api'
import ProjectDetails from './ProjectDetails'

type Project = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
}

type ProjectPage = {
    projects: Project[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

export default function OpenProjects() {
    const [page, setPage] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [data, setData] = useState<ProjectPage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProjects() {
            setLoading(true)
            setError('')
            setData(null)

            try {
                const result = await getJson<ProjectPage>(
                    `/api/v1/projects?page=${page}&size=5`,
                    controller.signal,
                )

                if (!controller.signal.aborted) {
                    setData(result)
                }
            } catch (failure) {
                if (controller.signal.aborted) return

                setError(
                    failure instanceof Error
                        ? failure.message
                        : 'Unable to load projects. Please try again.',
                )
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProjects()

        return () => controller.abort()
    }, [page, attempt])

    if (selectedProjectId !== null) {
        return (
            <div id="projects" className="py-4">
                <ProjectDetails
                    projectId={selectedProjectId}
                    onBack={() => setSelectedProjectId(null)}
                />
            </div>
        )
    }

    return (
        <section
            id="projects"
            className="py-4"
            aria-labelledby="projects-title"
            aria-busy={loading}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Marketplace Feed
                    </span>
                    <h2 id="projects-title" className="text-2xl font-bold font-heading text-slate-900 mt-2">
                        Open Projects
                    </h2>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Discover new briefs and submit proposals directly to clients.
                    </p>
                </div>

                {data && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200 self-start sm:self-auto">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        {data.totalElements} {data.totalElements === 1 ? 'project' : 'projects'} available
                    </span>
                )}
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3" role="status">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium">Finding available projects…</p>
                </div>
            )}

            {error && (
                <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 my-4 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-3">
                        <p className="text-sm font-medium" role="alert">{error}</p>
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                            onClick={() => setAttempt((value) => value + 1)}
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {data && data.projects.length === 0 && (
                <div className="text-center p-12 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto my-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No open projects on this page</h3>
                    <p className="text-xs text-slate-500 mb-6">
                        New briefs will appear here as soon as clients publish projects.
                    </p>
                    {page > 0 && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-sm"
                            onClick={() => setPage(0)}
                        >
                            Back to first page
                        </button>
                    )}
                </div>
            )}

            {data && data.projects.length > 0 && (
                <ul className="space-y-4">
                    {data.projects.map((project) => (
                        <li
                            key={project.id}
                            className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        <Sparkles className="w-3 h-3 text-emerald-500" />
                                        Open for proposals
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                    <button
                                        type="button"
                                        className="text-left font-inherit hover:underline decoration-emerald-500 underline-offset-4 flex items-center gap-1 cursor-pointer"
                                        onClick={() => setSelectedProjectId(project.id)}
                                    >
                                        <span>{project.title}</span>
                                        <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 inline shrink-0" />
                                    </button>
                                </h3>

                                <p className="mt-2.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 shrink-0">
                                <span className="text-xs text-slate-400 font-medium">Budget</span>
                                <span className="text-lg font-extrabold text-slate-900 font-heading">
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: project.currency,
                                        maximumFractionDigits: 2,
                                    }).format(project.budget)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedProjectId(project.id)}
                                    className="hidden sm:inline-flex items-center gap-1 mt-3 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-all"
                                >
                                    View Details
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalPages > 1 && (
                <nav className="flex items-center justify-between border-t border-slate-200 mt-8 pt-4" aria-label="Project pages">
                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        disabled={page === 0}
                        onClick={() => setPage((value) => value - 1)}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                    </button>

                    <span className="text-xs font-medium text-slate-500" aria-live="polite">
                        Page <strong className="text-slate-800">{data.page + 1}</strong> of <strong className="text-slate-800">{data.totalPages}</strong>
                    </span>

                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
                        disabled={data.last}
                        onClick={() => setPage((value) => value + 1)}
                    >
                        Next
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </nav>
            )}
        </section>
    )
}
