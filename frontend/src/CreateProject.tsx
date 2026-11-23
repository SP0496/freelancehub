import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { PlusCircle, Sparkles, CheckCircle, AlertCircle, Loader2, IndianRupee } from 'lucide-react'
import { ApiError, postJson } from './api'

type CreatedProject = {
    id: string
    title: string
}

type CreateProjectProps = {
    onCreated?: () => void
}

export default function CreateProject({
    onCreated,
}: CreateProjectProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [budget, setBudget] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [created, setCreated] = useState<CreatedProject | null>(null)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const submissionInProgress = useRef(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (submissionInProgress.current || created) {
            return
        }

        setError('')
        setFieldErrors({})

        const errors: Record<string, string> = {}
        const amount = Number(budget)

        if (!title.trim()) {
            errors.title = 'Please enter a project title.'
        }

        if (!description.trim()) {
            errors.description = 'Please describe the project.'
        }

        if (
            !budget.trim() ||
            !Number.isFinite(amount) ||
            amount < 0.01 ||
            amount > 9999999999.99
        ) {
            errors.budget = 'Enter a budget greater than zero.'
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        submissionInProgress.current = true
        setSubmitting(true)

        let savedProject: CreatedProject

        try {
            savedProject = await postJson<CreatedProject>(
                '/api/v1/projects',
                {
                    title: title.trim(),
                    description: description.trim(),
                    budget: amount,
                },
            )
        } catch (failure) {
            if (failure instanceof ApiError) {
                setError(failure.message)

                const backendErrors: Record<string, string> = {}
                for (const item of failure.errors) {
                    backendErrors[item.field] = item.message
                }
                setFieldErrors(backendErrors)
            } else {
                setError(
                    'Could not confirm creation. Check your projects before trying again.',
                )
            }
            return
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }

        setCreated(savedProject)
        onCreated?.()
    }

    function startAnotherProject() {
        setTitle('')
        setDescription('')
        setBudget('')
        setError('')
        setFieldErrors({})
        setCreated(null)
    }

    return (
        <section
            id="create-project"
            className="max-w-2xl mx-auto py-6"
            aria-labelledby="create-project-title"
        >
            <div className="mb-8">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Commission Work
                </span>
                <h2 id="create-project-title" className="text-2xl font-bold font-heading text-slate-900 mt-2">
                    Post a Project
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Describe your project scope and budget to receive competitive proposals from vetted talent.
                </p>
            </div>

            {created ? (
                <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center text-emerald-950 shadow-sm" role="status">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/20">
                        <CheckCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold font-heading text-emerald-900 mb-1">Project published</h3>
                    <p className="text-sm text-emerald-700 max-w-md mx-auto mb-6">
                        “{created.title}” is now live and accepting proposals from freelancers.
                    </p>
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all cursor-pointer"
                        onClick={startAnotherProject}
                    >
                        <PlusCircle className="w-4 h-4" />
                        Post another project
                    </button>
                </div>
            ) : (
                <form
                    className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
                    onSubmit={handleSubmit}
                    aria-busy={submitting}
                >
                    <fieldset disabled={submitting} className="space-y-6">
                        <div>
                            <label htmlFor="project-title" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Project Title <span className="text-emerald-600">*</span>
                            </label>
                            <input
                                id="project-title"
                                type="text"
                                required
                                maxLength={150}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="e.g. Build a high-converting SaaS landing page with React"
                                aria-invalid={Boolean(fieldErrors.title)}
                                aria-describedby={fieldErrors.title ? 'project-title-error' : undefined}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                    fieldErrors.title
                                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                }`}
                            />
                            {fieldErrors.title && (
                                <p id="project-title-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="project-description" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Project Description & Deliverables <span className="text-emerald-600">*</span>
                            </label>
                            <textarea
                                id="project-description"
                                required
                                maxLength={10000}
                                rows={6}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Describe the scope, tech stack requirements, expected deliverables, and any deadlines…"
                                aria-invalid={Boolean(fieldErrors.description)}
                                aria-describedby={fieldErrors.description ? 'project-description-error' : undefined}
                                className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 transition-all outline-none resize-y ${
                                    fieldErrors.description
                                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                }`}
                            />
                            {fieldErrors.description && (
                                <p id="project-description-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.description}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="project-budget" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Total Budget (INR) <span className="text-emerald-600">*</span>
                            </label>
                            <div className="relative max-w-xs">
                                <span className="absolute left-3.5 top-3 text-slate-400">
                                    <IndianRupee className="w-4 h-4" />
                                </span>
                                <input
                                    id="project-budget"
                                    type="number"
                                    required
                                    min="0.01"
                                    max="9999999999.99"
                                    step="0.01"
                                    value={budget}
                                    onChange={(event) => setBudget(event.target.value)}
                                    placeholder="25000.00"
                                    aria-invalid={Boolean(fieldErrors.budget)}
                                    aria-describedby={fieldErrors.budget ? 'project-budget-error' : undefined}
                                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                        fieldErrors.budget
                                            ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                    }`}
                                />
                            </div>
                            {fieldErrors.budget && (
                                <p id="project-budget-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.budget}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 p-3 rounded-lg bg-rose-50 border border-rose-100" role="alert">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </p>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Publishing…</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Publish project</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </fieldset>
                </form>
            )}
        </section>
    )
}
