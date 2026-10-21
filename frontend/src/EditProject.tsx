import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
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
    const [fieldErrors, setFieldErrors] = useState<
        Record<string, string>
    >({})

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
        <section aria-labelledby="edit-project-title">
            <button
                className="secondary-button"
                type="button"
                disabled={submitting}
                onClick={onCancel}
            >
                ← Back to my projects
            </button>

            <div className="project-detail-content">
                <p className="eyebrow">REFINE YOUR BRIEF</p>
                <h2 id="edit-project-title">Edit project</h2>

                <p className="proposal-intro">
                    Update the requirements and budget before choosing a proposal.
                </p>

                <form onSubmit={handleSubmit} aria-busy={submitting}>
                    <fieldset className="proposal-fields" disabled={submitting}>
                        <legend className="proposal-legend">
                            Project details
                        </legend>

                        <div className="form-field">
                            <label htmlFor="edit-project-name">Project title</label>

                            <input
                                id="edit-project-name"
                                type="text"
                                required
                                maxLength={150}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.title)}
                                aria-describedby={
                                    fieldErrors.title ? 'edit-title-error' : undefined
                                }
                            />

                            {fieldErrors.title && (
                                <p id="edit-title-error" className="field-error" role="alert">
                                    {fieldErrors.title}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="edit-project-description">
                                Project description
                            </label>

                            <textarea
                                id="edit-project-description"
                                required
                                maxLength={10000}
                                rows={7}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.description)}
                                aria-describedby={
                                    fieldErrors.description
                                        ? 'edit-description-error'
                                        : undefined
                                }
                            />

                            {fieldErrors.description && (
                                <p
                                    id="edit-description-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {fieldErrors.description}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="edit-project-budget">
                                Budget ({project.currency})
                            </label>

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
                                aria-describedby={
                                    fieldErrors.budget ? 'edit-budget-error' : undefined
                                }
                            />

                            {fieldErrors.budget && (
                                <p id="edit-budget-error" className="field-error" role="alert">
                                    {fieldErrors.budget}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="projects-error" role="alert">
                                {error}
                            </p>
                        )}

                        <div className="proposal-action-buttons">
                            <button
                                className="account-button"
                                type="submit"
                                disabled={submitting}
                            >
                                {submitting ? 'Saving…' : 'Save changes'}
                            </button>

                            <button
                                className="secondary-button"
                                type="button"
                                disabled={submitting}
                                onClick={onCancel}
                            >
                                Cancel editing
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </section>
    )
}