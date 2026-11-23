import React, { useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../../components/common/Button'
import { ShieldCheck, LogIn, CheckCircle2 } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { isAuthenticated, portal, setPortal, login } = usePortal()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else {
        navigate(portal === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard', {
          replace: true,
        })
      }
    }
  }, [isAuthenticated, portal, navigate, location.state])

  const handleRoleToggle = (selectedRole: 'freelancer' | 'client') => {
    setPortal(selectedRole)
  }

  const handleSignIn = () => {
    void login()
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs">
        <div className="text-center mb-8">
          <span className="w-10 h-10 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-lg font-heading mx-auto mb-4">
            FH
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Sign in to FreelanceHub
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Enterprise Single Sign-On powered by Keycloak IAM
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Target Workspace
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-md border border-slate-200">
            <button
              type="button"
              onClick={() => handleRoleToggle('freelancer')}
              className={`py-2 text-xs font-semibold rounded transition-colors ${
                portal === 'freelancer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Freelancer
            </button>
            <button
              type="button"
              onClick={() => handleRoleToggle('client')}
              className={`py-2 text-xs font-semibold rounded transition-colors ${
                portal === 'client'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Client
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-6 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Signing in as {portal === 'freelancer' ? 'Independent Freelancer' : 'Enterprise Client'}
            </span>
          </div>
          <p className="leading-relaxed text-slate-500">
            Authentication is centrally protected via OAuth2 and OpenID Connect with automatic token refresh.
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleSignIn}
          className="w-full justify-center"
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Authenticate with Keycloak
        </Button>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
          <p>
            Need a new account?{' '}
            <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit TLS encrypted session</span>
          </div>
        </div>
      </div>
    </div>
  )
}
