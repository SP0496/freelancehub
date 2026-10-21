import { useState } from 'react'
import { keycloak } from './auth'

export default function AuthButtons() {
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const signedIn = Boolean(keycloak.authenticated)

    const username = String(
        keycloak.tokenParsed?.preferred_username ?? 'Your account',
    )

    async function handleAccountAction() {
        setBusy(true)
        setError('')

        try {
            const redirectUri = window.location.origin + '/'

            if (signedIn) {
                await keycloak.logout({ redirectUri })
            } else {
                await keycloak.login({ redirectUri })
            }
        } catch {
            setError('Something went wrong. Please try again.')
            setBusy(false)
        }
    }

    return (
        <div className="account-controls">
            {signedIn && (
                <span className="account-name">
          {username}
        </span>
            )}

            <button
                type="button"
                className="account-button"
                disabled={busy}
                onClick={() => void handleAccountAction()}
            >
                {busy ? 'Please wait…' : signedIn ? 'Sign out' : 'Sign in'}
            </button>

            {error && (
                <span className="account-error" role="alert">
          {error}
        </span>
            )}
        </div>
    )
}