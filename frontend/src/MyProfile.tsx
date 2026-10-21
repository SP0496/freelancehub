import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
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
    const [fieldErrors, setFieldErrors] = useState<
        Record<string, string>
    >({})

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
                    setError(
                        failure instanceof Error
                            ? failure.message
                            : 'Unable to load your profile.',
                    )
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
            className="projects-section"
            aria-labelledby="my-profile-title"
            aria-busy={loading || saving}
        >
            <div className="projects-heading">
                <div>
                    <p className="eyebrow">INTRODUCE YOURSELF</p>
                    <h2 id="my-profile-title">My profile</h2>
                </div>
            </div>

            {loading && (
                <p className="projects-message" role="status">
                    Loading your profile…
                </p>
            )}

            {error && (
                <div className="projects-message">
                    <p className="projects-error" role="alert">
                        {error}
                    </p>

                    <button
                        className="secondary-button"
                        type="button"
                        disabled={loading || saving}
                        onClick={() => {
                            setSuccess('')
                            setFieldErrors({})
                            setAttempt((value) => value + 1)
                        }}
                    >
                        Reload profile
                    </button>
                </div>
            )}

            {loaded && !loading && (
                <form
                    className="project-detail-content"
                    onSubmit={handleSubmit}
                    onChange={() => setSuccess('')}
                >
                    <fieldset className="proposal-fields" disabled={saving}>
                        <legend className="proposal-legend">
                            Tell people your name and what you do.
                        </legend>

                        <div className="form-field">
                            <label htmlFor="profile-display-name">
                                Display name
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
                                aria-describedby={
                                    fieldErrors.displayName
                                        ? 'profile-name-error'
                                        : undefined
                                }
                            />

                            {fieldErrors.displayName && (
                                <p
                                    id="profile-name-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {fieldErrors.displayName}
                                </p>
                            )}
                        </div>

                        <div className="form-field">
                            <label htmlFor="profile-headline">
                                Headline (optional)
                            </label>

                            <input
                                id="profile-headline"
                                type="text"
                                maxLength={160}
                                value={headline}
                                onChange={(event) => setHeadline(event.target.value)}
                                placeholder="For example, Java Full Stack Developer"
                                aria-invalid={Boolean(fieldErrors.headline)}
                                aria-describedby={
                                    fieldErrors.headline
                                        ? 'profile-headline-error'
                                        : undefined
                                }
                            />

                            {fieldErrors.headline && (
                                <p
                                    id="profile-headline-error"
                                    className="field-error"
                                    role="alert"
                                >
                                    {fieldErrors.headline}
                                </p>
                            )}
                        </div>

                        <button
                            className="account-button"
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? 'Saving…' : 'Save profile'}
                        </button>
                    </fieldset>

                    {success && (
                        <p className="project-status" role="status">
                            {success}
                        </p>
                    )}
                </form>
            )}
        </section>
    )
}