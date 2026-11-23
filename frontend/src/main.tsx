import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeAuth } from './auth'
import { Sparkles, RefreshCw } from 'lucide-react'

const root = createRoot(document.getElementById('root')!)

root.render(
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6" role="status">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-600/20 mb-4 animate-bounce">
            <Sparkles className="w-6 h-6 text-white" />
        </div>
        <p className="text-base font-semibold text-slate-700">Connecting to FreelanceHub…</p>
        <p className="text-xs text-slate-400 mt-1">Securing your session</p>
    </div>,
)

initializeAuth()
    .then(() => {
        root.render(
            <StrictMode>
                <App />
            </StrictMode>,
        )
    })
    .catch(() => {
        root.render(
            <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Unable to connect</h1>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                    We couldn't connect to the authentication service. Please ensure the identity server is reachable.
                </p>
                <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm transition-all shadow-md shadow-emerald-600/20"
                    onClick={() => window.location.reload()}
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
            </main>,
        )
    })
