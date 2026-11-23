import { useState } from 'react'
import { LogIn, LogOut, Loader2 } from 'lucide-react'
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
        <div className="flex items-center gap-3">
            {signedIn && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="max-w-[120px] sm:max-w-[160px] truncate">{username}</span>
                </div>
            )}

            <button
                type="button"
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm ${
                    signedIn
                        ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                } disabled:opacity-60 disabled:cursor-wait`}
                disabled={busy}
                onClick={() => void handleAccountAction()}
            >
                {busy ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Please wait…</span>
                    </>
                ) : signedIn ? (
                    <>
                        <LogOut className="w-4 h-4 text-slate-500" />
                        <span>Sign out</span>
                    </>
                ) : (
                    <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign in</span>
                    </>
                )}
            </button>

            {error && (
                <span className="text-xs text-rose-600 font-medium" role="alert">
                    {error}
                </span>
            )}
        </div>
    )
}
