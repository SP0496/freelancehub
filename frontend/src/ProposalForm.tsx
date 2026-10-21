import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { ApiError, postJson } from './api'

type ProposalFormProps = {
    projectId: string
    currency: string
}

type ProposalResponse = {
    id: string
    status: string
}

export default function ProposalForm({
                                         projectId,
                                         currency,
                                     }: ProposalFormProps) {
    const [coverLetter, setCoverLetter] = useState('')
    const [proposedAmount, setProposedAmount] = useState('')
    const [deliveryDays, setDeliveryDays] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')
    const [fieldErrors, setFieldErrors] = useState<
        Record<string, string>
    >({})

    const submissionInProgress = useRef(false)

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (submissionInProgress.current || submitted) {
            return
        }

        setError('')
        setFieldErrors({})

        const errors: Record<string, string> = {}
        const amount = Number(proposedAmount)
        const days = Number(deliveryDays)

        if (!coverLetter.trim()) {
            errors.coverLetter = 'Please write a cover letter.'
        }

        if (
            !proposedAmount.trim() ||
            !Number.isFinite(amount) ||
            amount < 0.01 ||
            amount > 9999999999.99
        ) {
            errors.proposedAmount = 'Enter a valid amount greater than zero.'
        }

        if (
            !deliveryDays.trim() ||
            !Number.isInteger(days) ||
            days < 1 ||
            days > 365
        ) {
            errors.deliveryDays = 'Enter a whole number from 1 to 365.'
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            return
        }

        submissionInProgress.current = true
        setSubmitting(true)

        try {
            await postJson<ProposalResponse>(
                `/api/v1/projects/${encodeURIComponent(projectId)}/proposals`,
                {
                    coverLetter: coverLetter.trim(),
                    proposedAmount: amount,
                    deliveryDays: days,
                },
            )

            setSubmitted(true)
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
                    'Could not confirm submission. Check My Proposals before trying again.',
                )
            }
        } finally {
            submissionInProgress.current = false
            setSubmitting(false)
        }
    }

    if (submitted) {
        return (
            <div className="proposal-success" role="status">
                <h3>Proposal submitted</h3>
                <p>
                    Your proposal has been sent to the project owner for review.
                </p>
            </div>
        )
    }

    return (
        <section
            className="proposal-section"
            aria-labelledby="proposal-form-title"
        >
            <p className="eyebrow">MAKE YOUR INTRODUCTION</p>
            <h3 id="proposal-form-title">Submit a proposal</h3>

            <p className="proposal-intro">
                Explain how you would approach the work, your price,
                and how long you need.
            </p>

            <form onSubmit={handleSubmit} aria-busy={submitting}>
                <fieldset className="proposal-fields" disabled={submitting}>
                    <legend className="proposal-legend">
                        Your proposal details
                    </legend>

                    <div className="form-field">
                        <label htmlFor="cover-letter">Cover letter</label>

                        <textarea
                            id="cover-letter"
                            value={coverLetter}
                            onChange={(event) => setCoverLetter(event.target.value)}
                            rows={6}
                            required
                            maxLength={10000}
                            placeholder="Describe your relevant experience and approach."
                            aria-invalid={Boolean(fieldErrors.coverLetter)}
                            aria-describedby={
                                fieldErrors.coverLetter ? 'cover-letter-error' : undefined
                            }
                        />

                        {fieldErrors.coverLetter && (
                            <p id="cover-letter-error" className="field-error" role="alert">
                                {fieldErrors.coverLetter}
                            </p>
                        )}
                    </div>

                    <div className="form-grid">
                        <div className="form-field">
                            <label htmlFor="proposed-amount">
                                Your price ({currency})
                            </label>

                            <input
                                id="proposed-amount"
                                type="number"
                                min="0.01"
                                max="9999999999.99"
                                step="0.01"
                                required
                                value={proposedAmount}
                                onChange={(event) => setProposedAmount(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.proposedAmount)}
                                aria-describedby={
                                    fieldErrors.proposedAmount ? 'amount-error' : undefined
                                }
                            />

                            {fieldErrors.proposedAmount && (
                                <p id="amount-error" className="field-error" role="alert">
                                    {fieldErrors.proposedAmount}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="delivery-days">Delivery time (days)</label>

                            <input
                                id="delivery-days"
                                type="number"
                                min="1"
                                max="365"
                                step="1"
                                required
                                value={deliveryDays}
                                onChange={(event) => setDeliveryDays(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.deliveryDays)}
                                aria-describedby={
                                    fieldErrors.deliveryDays ? 'days-error' : undefined
                                }
                            />

                            {fieldErrors.deliveryDays && (
                                <p id="days-error" className="field-error" role="alert">
                                    {fieldErrors.deliveryDays}
                                </p>
                            )}
                        </div>
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
                        {submitting ? 'Submitting…' : 'Submit proposal'}
                    </button>
                </fieldset>
            </form>
        </section>
    )
}