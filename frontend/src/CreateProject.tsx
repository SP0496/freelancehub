import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
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
    const [fieldErrors, setFieldErrors] = useState<
        Record<string, string>
    >({})

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
            className="projects-section"
            aria-labelledby="create-project-title"
        >
            <div className="projects-heading">
                <div>
                    <p className="eyebrow">BRING YOUR IDEA TO LIFE</p>
                    <h2 id="create-project-title">Post a project</h2>
                </div>
            </div>

            {created ? (
                <div className="proposal-success" role="status">
                    <h3>Project published</h3>
                    <p>
                        “{created.title}” is now open for proposals.
                    </p>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={startAnotherProject}
                    >
                        Post another project
                    </button>
                </div>
            ) : (
                <form
                    className="project-detail-content"
                    onSubmit={handleSubmit}
                    aria-busy={submitting}
                >
                    <fieldset className="proposal-fields" disabled={submitting}>
                        <legend className="proposal-legend">
                            Describe the work and set your budget. Currency: INR.
                        </legend>

                        <div className="form-field">
                            <label htmlFor="project-title">Project title</label>

                            <input
                                id="project-title"
                                type="text"
                                required
                                maxLength={150}
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="For example, build a business website"
                                aria-invalid={Boolean(fieldErrors.title)}
                                aria-describedby={
                                    fieldErrors.title ? 'project-title-error' : undefined
                                }
                            />

                            {fieldErrors.title && (
                                <p
                                    id="project-title-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {fieldErrors.title}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="project-description">
                                Project description
                            </label>

                            <textarea
                                id="project-description"
                                required
                                maxLength={10000}
                                rows={7}
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Explain what you need, the deliverables, and any requirements."
                                aria-invalid={Boolean(fieldErrors.description)}
                                aria-describedby={
                                    fieldErrors.description
                                        ? 'project-description-error'
                                        : undefined
                                }
                            />

                            {fieldErrors.description && (
                                <p
                                    id="project-description-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {fieldErrors.description}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="project-budget">Budget (INR)</label>

                            <input
                                id="project-budget"
                                type="number"
                                required
                                min="0.01"
                                max="9999999999.99"
                                step="0.01"
                                value={budget}
                                onChange={(event) => setBudget(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.budget)}
                                aria-describedby={
                                    fieldErrors.budget ? 'project-budget-error' : undefined
                                }
                            />

                            {fieldErrors.budget && (
                                <p
                                    id="project-budget-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {fieldErrors.budget}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="projects-error" role="alert">
                                {error}
                            </p>
                        )}

                        <button
                            className="account-button"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? 'Publishing…' : 'Publish project'}
                        </button>
                    </fieldset>
                </form>
            )}
        </section>
    )
}