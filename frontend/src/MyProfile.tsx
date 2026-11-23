import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { User, Sparkles, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { ApiError, getJson, putJson } from './api'

type Profile = {
    displayName: string
    headline: string | null
}

export default function MyProfile() {
    const [displayName, setDisplayName] = useState('')
    const [headline, setHeadline] = useState('')
    const [loading, setLoading] = useState(true)
    const [loaded, setLoaded] = useState(false)
    const [saving, setSaving] = useState(false)
    const [attempt, setAttempt] = useState(0)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

    const saveInProgress = useRef(false)

    useEffect(() => {
        const controller = new AbortController()

        async function loadProfile() {
            setLoading(true)
            setLoaded(false)
            setError('')

            try {
                const profile = await getJson<Profile>(
                    '/api/v1/users/me',
                    controller.signal,
                )

                if (!controller.signal.aborted) {
                    setDisplayName(profile.displayName)
                    setHeadline(profile.headline ?? '')
                    setLoaded(true)
                }
            } catch (failure) {
                if (!controller.signal.aborted) {
                    if (failure instanceof ApiError && failure.status === 404) {
                        // Brand new user: allow them to create a profile!
                        setDisplayName('')
                        setHeadline('')
                        setLoaded(true)
                    } else {
                        setError(
                            failure instanceof Error
                                ? failure.message
                                : 'Unable to load your profile.',
                        )
                    }
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false)
                }
            }
        }

        void loadProfile()

        return () => controller.abort()
    }, [attempt])

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (saveInProgress.current || !loaded) {
            return
        }

        setError('')
        setSuccess('')
        setFieldErrors({})

        if (!displayName.trim()) {
            setFieldErrors({
                displayName: 'Please enter your display name.',
            })
            return
        }

        saveInProgress.current = true
        setSaving(true)

        try {
            const profile = await putJson<Profile>(
                '/api/v1/users/me',
                {
                    displayName: displayName.trim(),
                    headline: headline.trim(),
                },
            )

            setDisplayName(profile.displayName)
            setHeadline(profile.headline ?? '')
            setSuccess('Your profile has been updated.')
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
                    'Could not confirm the update. Reload your profile before trying again.',
                )
            }
        } finally {
            saveInProgress.current = false
            setSaving(false)
        }
    }

    return (
        <section
            id="my-profile"
            className="max-w-2xl mx-auto py-6"
            aria-labelledby="my-profile-title"
            aria-busy={loading || saving}
        >
            <div className="mb-8">
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    Account Profile
                </span>
                <h2 id="my-profile-title" className="text-2xl font-bold font-heading text-slate-900 mt-2">
                    My Profile
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Your public identity for project owners and freelancers across the marketplace.
                </p>
            </div>

            {loading && (
                <div className="flex items-center gap-3 p-8 justify-center text-slate-500" role="status">
                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                    <span className="text-sm">Loading your profile…</span>
                </div>
            )}

            {error && !loaded && (
                <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium" role="alert">{error}</p>
                            <button
                                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                                type="button"
                                disabled={loading || saving}
                                onClick={() => {
                                    setSuccess('')
                                    setFieldErrors({})
                                    setAttempt((value) => value + 1)
                                }}
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                Reload profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {loaded && !loading && (
                <form
                    className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8"
                    onSubmit={handleSubmit}
                    onChange={() => setSuccess('')}
                >
                    <fieldset disabled={saving} className="space-y-6">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-emerald-500/20">
                                {displayName ? displayName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {displayName || 'New Profile'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {headline || 'Introduce yourself to start collaborating'}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="profile-display-name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Display Name <span className="text-emerald-600">*</span>
                            </label>
                            <input
                                id="profile-display-name"
                                type="text"
                                autoComplete="name"
                                required
                                maxLength={100}
                                value={displayName}
                                onChange={(event) => setDisplayName(event.target.value)}
                                aria-invalid={Boolean(fieldErrors.displayName)}
                                aria-describedby={fieldErrors.displayName ? 'profile-name-error' : undefined}
                                placeholder="Your full name or freelance agency"
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                    fieldErrors.displayName
                                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                }`}
                            />
                            {fieldErrors.displayName && (
                                <p id="profile-name-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.displayName}
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="profile-headline" className="block text-sm font-semibold text-slate-700 mb-1.5">
                                Professional Headline <span className="text-xs font-normal text-slate-400">(optional)</span>
                            </label>
                            <input
                                id="profile-headline"
                                type="text"
                                maxLength={160}
                                value={headline}
                                onChange={(event) => setHeadline(event.target.value)}
                                placeholder="e.g. Senior Full-Stack Architect / React & Spring Boot"
                                aria-invalid={Boolean(fieldErrors.headline)}
                                aria-describedby={fieldErrors.headline ? 'profile-headline-error' : undefined}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-slate-900 transition-all outline-none ${
                                    fieldErrors.headline
                                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                                        : 'border-slate-200 hover:border-slate-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                                }`}
                            />
                            {fieldErrors.headline && (
                                <p id="profile-headline-error" className="mt-1.5 text-xs text-rose-600 flex items-center gap-1" role="alert">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    {fieldErrors.headline}
                                </p>
                            )}
                        </div>

                        {error && (
                            <p className="text-xs font-medium text-rose-600 flex items-center gap-1.5 p-3 rounded-lg bg-rose-50 border border-rose-100" role="alert">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </p>
                        )}

                        {success && (
                            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5 p-3 rounded-lg bg-emerald-50 border border-emerald-100" role="status">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {success}
                            </p>
                        )}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/25 transition-all disabled:opacity-60"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Saving…</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>Save profile</span>
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
