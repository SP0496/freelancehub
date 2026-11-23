import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../../components/common/Button'
import {
  ShieldCheck,
  LogIn,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
} from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { portal, setPortal, loginWithCredentials } = usePortal()
  const navigate = useNavigate()
  const location = useLocation()

  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleRoleToggle = (selectedRole: 'freelancer' | 'client') => {
    setPortal(selectedRole)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !passwordInput) {
      setErrorMsg('Please enter both your username/email and password.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg(null)
      await loginWithCredentials(usernameInput.trim(), passwordInput)

      const from = (location.state as { from?: { pathname: string } })?.from?.pathname
      if (from) {
        navigate(from, { replace: true })
      } else {
        navigate(portal === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard', {
          replace: true,
        })
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid credentials. Please verify and try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickAccount = (user: string, pass: string) => {
    setUsernameInput(user)
    setPasswordInput(pass)
    setErrorMsg(null)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <span className="w-10 h-10 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-lg font-heading mx-auto mb-3">
            FH
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Sign In to FreelanceHub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your verified commercial marketplace workspace
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="mb-5">
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

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 mb-5 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Username or Email *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="e.g. satish or user@example.com"
              className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password *
              </label>
              <span className="text-[11px] text-slate-400">Case-sensitive</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter your account password"
                className="w-full pl-3 pr-10 py-2.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Login Helper */}
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800 flex items-center gap-1 mb-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Available Accounts:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillQuickAccount('satish', 'Satish123!')}
                className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[10px] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                satish (Satish123!)
              </button>
              <button
                type="button"
                onClick={() => fillQuickAccount('ravi', 'Ravi123!')}
                className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700 font-mono text-[10px] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
              >
                ravi (Ravi123!)
              </button>
            </div>
          </div>

          <Button
            variant="secondary"
            size="lg"
            type="submit"
            isLoading={loading}
            className="w-full justify-center mt-2"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In to {portal === 'freelancer' ? 'Freelancer Portal' : 'Client Portal'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct OAuth2 JWT token authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}
