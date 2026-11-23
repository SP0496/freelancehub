import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, Check, AlertCircle, Loader2, IndianRupee } from 'lucide-react'
import { ApiError, putJson } from './api'

type EditableProject = {
    id: string
    title: string
    description: string
    budget: number
    currency: string
    version: number
}

type EditProjectProps = {
    project: EditableProject
    onSaved: () => void
    onCancel: () => void
}

export default function EditProject({
    project,
    onSaved,
    onCancel,
}: EditProjectProps) {
    const [title, setTitle] = useState(project.title)
    const [description, setDescription] = useState(project.description)
    const [budget, setBudget] = useState(String(project.budget))
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const submissionInProgress = useRef(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (submissionInProgress.current) {
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

        try {
            await putJson<EditableProject>(
                `/api/v1/projects/${encodeURIComponent(project.id)}`,
                {
                    title: title.trim(),
                    description: description.trim(),
                    budget: amount,
                    version: project.version,
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
                    'Could not confirm the update. Go back and refresh your projects before trying again.',
                )
            }
            return
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }

        onSaved()
    }

    return (
        <section className="max-w-2xl mx-auto py-6" aria-labelledby="edit-project-title">
            <button
                className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm"
                type="button"
                disabled={submitting}
                onClick={onCancel}
            >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to my projects
            </button>

            <div className="mb-8">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Modify Brief
                </span>
                <h2 id="edit-project-title" className="text-2xl font-bold font-heading text-slate-900 mt-2">
                    Edit project
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Update the scope or budget before accepting a freelancer proposal.
                </p>
            </div>

            <form
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
                onSubmit={handleSubmit}
                aria-busy={submitting}
            >
                <fieldset disabled={submitting} className="space-y-6">
                    <div>
                        <label htmlFor="edit-project-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Project Title <span className="text-emerald-600">*</span>
                        </label>
                        <input
                            id="edit-project-name"
                            type="text"
                            required
                            maxLength={150}
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            aria-invalid={Boolean(fieldErrors.title)}
                            aria-describedby={fieldErrors.title ? 'edit-title-error' : undefined}
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                fieldErrors.title
                                    ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                    : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                            }`}
                        />
                        {fieldErrors.title && (
                            <p id="edit-title-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {fieldErrors.title}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="edit-project-description" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Project Description <span className="text-emerald-600">*</span>
                        </label>
                        <textarea
                            id="edit-project-description"
                            required
                            maxLength={10000}
                            rows={6}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            aria-invalid={Boolean(fieldErrors.description)}
                            aria-describedby={fieldErrors.description ? 'edit-description-error' : undefined}
                            className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 transition-all outline-none resize-y ${
                                fieldErrors.description
                                    ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                    : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                            }`}
                        />
                        {fieldErrors.description && (
                            <p id="edit-description-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {fieldErrors.description}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="edit-project-budget" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Budget ({project.currency}) <span className="text-emerald-600">*</span>
                        </label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-3.5 top-3 text-slate-400">
                                <IndianRupee className="w-4 h-4" />
                            </span>
                            <input
                                id="edit-project-budget"
                                type="number"
                                required
                                min="0.01"
                                max="9999999999.99"
                                step="0.01"
                                value={budget}
                                onChange={(event) => setBudget(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.budget)}
                                aria-describedby={fieldErrors.budget ? 'edit-budget-error' : undefined}
                                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                    fieldErrors.budget
                                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                }`}
                            />
                        </div>
                        {fieldErrors.budget && (
                            <p id="edit-budget-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
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

                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onCancel}
                            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all"
                        >
                            Cancel editing
                        </button>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Saving…</span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span>Save changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </fieldset>
            </form>
        </section>
    )
}
