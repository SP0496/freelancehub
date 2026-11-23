import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { initializeAuth } from './auth'
import { ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react'

const root = createRoot(document.getElementById('root')!)

root.render(
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-800 p-6" role="status">
    <div className="w-12 h-12 rounded-lg bg-[#172B4D] text-white flex items-center justify-center font-bold text-lg font-heading mb-4 shadow-xs">
      FH
    </div>
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
      <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
      <span>Connecting to FreelanceHub Secure Gateway...</span>
    </div>
    <p className="text-[11px] text-slate-400 mt-1">Verifying Keycloak IAM session</p>
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
      <main className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] text-slate-800 p-6 text-center">
        <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold font-heading text-slate-900 mb-2">Unable to connect to Identity Service</h1>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          The Keycloak identity server is unreachable or offline. Please verify network access or local service status.
        </p>
        <button
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#172B4D] hover:bg-slate-800 text-white font-medium text-xs transition-colors shadow-xs"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </main>,
    )
  })
