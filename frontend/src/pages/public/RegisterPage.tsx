import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../../components/common/Button'
import { ShieldCheck, UserPlus, CheckCircle2 } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const { isAuthenticated, portal, setPortal, register } = usePortal()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate(portal === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard', {
        replace: true,
      })
    }
  }, [isAuthenticated, portal, navigate])

  const handleRoleToggle = (selectedRole: 'freelancer' | 'client') => {
    setPortal(selectedRole)
  }

  const handleSignUp = () => {
    void register()
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white border border-slate-200 rounded-lg p-8 shadow-xs">
        <div className="text-center mb-8">
          <span className="w-10 h-10 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-lg font-heading mx-auto mb-4">
            FH
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Create your Account
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Join the verified FreelanceHub network
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Register as
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
              {portal === 'freelancer'
                ? 'Freelancer profile with proposal privileges'
                : 'Client profile with project posting privileges'}
            </span>
          </div>
          <p className="leading-relaxed text-slate-500">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-[#2563EB] hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-[#2563EB] hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleSignUp}
          className="w-full justify-center"
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Register with Keycloak
        </Button>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Standard OIDC User Registration</span>
          </div>
        </div>
      </div>
    </div>
  )
}
