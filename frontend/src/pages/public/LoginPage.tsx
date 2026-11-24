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
  Mail,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { portal, setPortal, loginWithCredentials, sendPasswordResetEmail } = usePortal()
  const navigate = useNavigate()
  const location = useLocation()

  // Navigation state passed from register or redirects
  const locationState = location.state as {
    from?: { pathname: string }
    username?: string
    registered?: boolean
  } | null

  // View state: 'login' | 'forgot-password'
  const [view, setView] = useState<'login' | 'forgot-password'>('login')

  // Credentials inputs - starts empty so user can fill manually or let Google Password Manager suggest
  const [usernameInput, setUsernameInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password inputs
  const [forgotInput, setForgotInput] = useState('')

  // Status & feedback
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(
    locationState?.registered
      ? 'Registration complete! Please sign in with your credentials.'
      : null,
  )

  const handleRoleToggle = (selectedRole: 'freelancer' | 'client') => {
    setPortal(selectedRole)
  }

  // Direct login for users who already have an account
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usernameInput.trim() || !passwordInput) {
      setErrorMsg('Please enter both your username/email and password.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg(null)
      setSuccessMsg(null)

      await loginWithCredentials(usernameInput.trim(), passwordInput)

      const from = locationState?.from?.pathname
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

  // Forgot password request via Keycloak SMTP
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!forgotInput.trim()) {
      setErrorMsg('Please enter your username or registered email address.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg(null)
      setSuccessMsg(null)

      const result = await sendPasswordResetEmail(forgotInput.trim())
      setSuccessMsg(
        `A password reset link has been dispatched to your Gmail (${result.maskedEmail}) via Keycloak SMTP. Please check your inbox and spam folders.`,
      )
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset link. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="w-10 h-10 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-lg font-heading mx-auto mb-3">
            FH
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            {view === 'login' ? 'Sign In to FreelanceHub' : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {view === 'login'
              ? 'Access your verified commercial marketplace workspace'
              : 'Receive a password reset link to your registered Gmail address'}
          </p>
        </div>

        {/* Normal Login View */}
        {view === 'login' && (
          <>
            {/* Target Workspace Selector */}
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

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3.5 mb-5 flex items-start gap-2.5 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 mb-5 flex items-start gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} method="POST" action="#" autoComplete="on" className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or Email *
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g. satish or user@example.com"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgot-password')
                      setForgotInput(usernameInput)
                      setErrorMsg(null)
                      setSuccessMsg(null)
                    }}
                    className="text-xs text-[#2563EB] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
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
          </>
        )}

        {/* Forgot Password View */}
        {view === 'forgot-password' && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-center">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <KeyRound className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-slate-700">
                Password Recovery
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Enter your account username or registered email. We will send a secure password reset link to your Gmail.
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username or Registered Email *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  placeholder="e.g. subbu or user@gmail.com"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>

              <Button
                variant="secondary"
                size="lg"
                type="submit"
                isLoading={loading}
                className="w-full justify-center mt-2"
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Send Password Reset Link
              </Button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setView('login')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#2563EB] font-semibold hover:underline">
              Create an account
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct OAuth2 & Keycloak Identity Provider</span>
          </div>
        </div>
      </div>
    </div>
  )
}
