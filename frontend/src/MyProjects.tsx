import { useEffect, useState } from 'react'
import { Briefcase, ArrowUpRight, Edit3, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { getJson } from './api'
import ProjectProposals from './ProjectProposals'
import CompleteProjectButton from './CompleteProjectButton'
import CancelProjectButton from './CancelProjectButton'
import EditProject from './EditProject'

type Project = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    status: string
    version: number
}

type ProjectPage = {
    projects: Project[]
    page: number
    size: number
    totalElements: number
    totalPages: number
    last: boolean
}

type MyProjectsProps = {
    onChanged?: () => void
}

export default function MyProjects({ onChanged }: MyProjectsProps) {
    const [page, setPage] = useState(0)
    const [attempt, setAttempt] = useState(0)
    const [data, setData] = useState<ProjectPage | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProjects() {
            setLoading(true)
            setError('')
            setData(null)

            try {
                const result = await getJson<ProjectPage>(
                    `/api/v1/projects/mine?page=${page}&size=5`,
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
                            : 'Unable to load your projects.',
                    )
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProjects()

        return () => controller.abort()
    }, [page, attempt])

    function handleProjectChanged() {
        setAttempt((value) => value + 1)
        onChanged?.()
    }

    function returnFromProposals() {
        setSelectedProject(null)
        handleProjectChanged()
    }

    function finishEditing() {
        setEditingProject(null)
        handleProjectChanged()
    }

    function cancelEditing() {
        setEditingProject(null)
        setAttempt((value) => value + 1)
    }

    if (editingProject) {
        return (
            <div id="my-projects" className="py-4">
                <EditProject
                    key={editingProject.id}
                    project={editingProject}
                    onSaved={finishEditing}
                    onCancel={cancelEditing}
                />
            </div>
        )
    }

    if (selectedProject) {
        return (
            <div id="my-projects" className="py-4">
                <ProjectProposals
                    key={selectedProject.id}
                    projectId={selectedProject.id}
                    projectTitle={selectedProject.title}
                    currency={selectedProject.currency}
                    onBack={returnFromProposals}
                />
            </div>
        )
    }

    return (
        <section
            id="my-projects"
            className="py-4"
            aria-labelledby="my-projects-title"
            aria-busy={loading}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        Client Workspace
                    </span>
                    <h2 id="my-projects-title" className="text-2xl font-bold font-heading text-slate-900 mt-2">
                        My Projects
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Manage your commissioned projects, review incoming bids, and track deliverables.
                    </p>
                </div>

                <button
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm self-start sm:self-auto cursor-pointer"
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
                    <p className="text-sm font-medium">Loading your projects…</p>
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

            {data && data.projects.length === 0 && (
                <div className="text-center p-12 rounded-3xl bg-white border border-slate-200 shadow-sm max-w-md mx-auto my-6">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">No projects posted yet</h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Commission your first freelance project to start receiving proposals.
                    </p>
                </div>
            )}

            {data && data.projects.length > 0 && (
                <ul className="space-y-4">
                    {data.projects.map((project) => (
                        <li
                            key={project.id}
                            className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all p-6 sm:p-7 flex flex-col md:flex-row md:items-start justify-between gap-6"
                        >
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                        project.status === 'OPEN'
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : project.status === 'IN_PROGRESS'
                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                            : project.status === 'COMPLETED'
                                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                    }`}>
                                        {project.status.replaceAll('_', ' ')}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-900 font-heading">
                                    {project.title}
                                </h3>

                                <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                    {project.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-2.5 mt-5">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProject(project)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                                    >
                                        <span>View proposals</span>
                                        <ArrowUpRight className="w-3.5 h-3.5" />
                                    </button>

                                    {project.status === 'OPEN' && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingProject(project)}
                                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all cursor-pointer"
                                        >
                                            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                                            <span>Edit project</span>
                                        </button>
                                    )}
                                </div>

                                {project.status === 'OPEN' && (
                                    <CancelProjectButton
                                        projectId={project.id}
                                        projectVersion={project.version}
                                        onCancelled={handleProjectChanged}
                                    />
                                )}

                                {project.status === 'IN_PROGRESS' && (
                                    <CompleteProjectButton
                                        projectId={project.id}
                                        projectVersion={project.version}
                                        onCompleted={handleProjectChanged}
                                    />
                                )}
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 shrink-0">
                                <span className="text-xs text-slate-400 font-medium">Budget</span>
                                <span className="text-lg font-extrabold font-heading text-slate-900">
                                    {new Intl.NumberFormat('en-IN', {
                                        style: 'currency',
                                        currency: project.currency,
                                        maximumFractionDigits: 2,
                                    }).format(project.budget)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {data && data.totalPages > 1 && (
                <nav className="flex items-center justify-between border-t border-slate-200 mt-8 pt-4" aria-label="My project pages">
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
