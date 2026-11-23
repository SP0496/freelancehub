import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Send, CheckCircle, AlertCircle, Loader2, Calendar, IndianRupee } from 'lucide-react'
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

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
            <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-200 text-center text-emerald-950" role="status">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-emerald-600/20">
                    <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold font-heading text-emerald-900 mb-1">Proposal submitted</h3>
                <p className="text-sm text-emerald-700 max-w-md mx-auto">
                    Your proposal has been delivered to the client. You can track updates under "My proposals".
                </p>
            </div>
        )
    }

    return (
        <section
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8"
            aria-labelledby="proposal-form-title"
        >
            <div className="mb-6">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Pitch Your Services
                </span>
                <h3 id="proposal-form-title" className="text-xl font-bold font-heading text-slate-900 mt-2">
                    Submit a proposal
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                    Describe your relevant experience, proposed timeline, and all-inclusive pricing.
                </p>
            </div>

            <form onSubmit={handleSubmit} aria-busy={submitting}>
                <fieldset disabled={submitting} className="space-y-5">
                    <div>
                        <label htmlFor="cover-letter" className="block text-sm font-semibold text-slate-700 mb-1.5">
                            Cover Letter <span className="text-emerald-600">*</span>
                        </label>
                        <textarea
                            id="cover-letter"
                            value={coverLetter}
                            onChange={(event) => setCoverLetter(event.target.value)}
                            rows={5}
                            required
                            maxLength={10000}
                            placeholder="Detail your approach, milestones, and why you are the best fit for this project…"
                            aria-invalid={Boolean(fieldErrors.coverLetter)}
                            aria-describedby={fieldErrors.coverLetter ? 'cover-letter-error' : undefined}
                            className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 transition-all outline-none resize-y ${
                                fieldErrors.coverLetter
                                    ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                    : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                            }`}
                        />
                        {fieldErrors.coverLetter && (
                            <p id="cover-letter-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {fieldErrors.coverLetter}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="proposed-amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Price ({currency}) <span className="text-emerald-600">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3 text-slate-400">
                                    <IndianRupee className="w-4 h-4" />
                                </span>
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
                                    aria-describedby={fieldErrors.proposedAmount ? 'amount-error' : undefined}
                                    placeholder="0.00"
                                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                        fieldErrors.proposedAmount
                                            ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                    }`}
                                />
                            </div>
                            {fieldErrors.proposedAmount && (
                                <p id="amount-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.proposedAmount}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="delivery-days" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Delivery Time (days) <span className="text-emerald-600">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-3 text-slate-400">
                                    <Calendar className="w-4 h-4" />
                                </span>
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
                                    aria-describedby={fieldErrors.deliveryDays ? 'days-error' : undefined}
                                    placeholder="7"
                                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                        fieldErrors.deliveryDays
                                            ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                            : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                    }`}
                                />
                            </div>
                            {fieldErrors.deliveryDays && (
                                <p id="days-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.deliveryDays}
                                </p>
                            )}
                        </div>
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
                                    <span>Submitting…</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>Submit proposal</span>
                                </>
                            )}
                        </button>
                    </div>
                </fieldset>
            </form>
        </section>
    )
}
