import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../../components/common/Button'
import {
  ShieldCheck,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Mail,
  ArrowLeft,
  RefreshCw,
  Clock,
} from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const { portal, setPortal, initiateRegistrationWithOtp, verifyRegistrationOtp, resendRegistrationOtp } = usePortal()
  const navigate = useNavigate()

  // Step: 'form' -> 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form')

  // Form inputs
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // OTP inputs & state
  const [otpInput, setOtpInput] = useState('')
  const [emailInfo, setEmailInfo] = useState<{
    email: string
    maskedEmail: string
    username: string
    devOtp?: string
    emailWarning?: string
  } | null>(null)

  // Feedback & Timers
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)
  const [expirySeconds, setExpirySeconds] = useState(600)

  const otpInputRef = useRef<HTMLInputElement>(null)

  // Timer countdowns during OTP step
  useEffect(() => {
    if (step !== 'otp') return

    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [step])

  // Focus OTP input on step transition
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRef.current?.focus()
      }, 100)
    }
  }, [step])

  const handleRoleToggle = (selectedRole: 'freelancer' | 'client') => {
    setPortal(selectedRole)
  }

  const formatTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Step 1: Submit details and initiate Gmail OTP verification
  const handleInitiateRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !email.trim() || !password || !firstName.trim() || !lastName.trim()) {
      setErrorMsg('Please complete all required fields.')
      return
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg(null)
      setSuccessMsg(null)

      const result = await initiateRegistrationWithOtp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role: portal === 'client' ? 'ROLE_CLIENT' : 'ROLE_FREELANCER',
      })

      setEmailInfo(result)
      setStep('otp')
      setOtpInput('')
      setCooldown(result.cooldown || 60)
      setExpirySeconds(result.expiresIn || 300)
      setSuccessMsg(result.message || `A 6-digit verification code has been dispatched to ${result.maskedEmail} via Keycloak SMTP.`)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and activate new account
  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanOtp = otpInput.trim()

    if (cleanOtp.length !== 6) {
      setErrorMsg('Please enter the complete 6-digit verification code.')
      return
    }

    if (expirySeconds <= 0) {
      setErrorMsg('Verification code has expired. Please request a new code.')
      return
    }

    try {
      setLoading(true)
      setErrorMsg(null)

      await verifyRegistrationOtp(username.trim(), password, cleanOtp)

      navigate(portal === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard', {
        replace: true,
      })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'OTP verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || resending) return

    try {
      setResending(true)
      setErrorMsg(null)
      const result = await resendRegistrationOtp(email.trim())
      setEmailInfo(result)
      setCooldown(result.cooldown || 60)
      setExpirySeconds(result.expiresIn || 300)
      setSuccessMsg(result.message || `A fresh verification code was sent to ${result.maskedEmail}.`)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to resend code. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtpInput(val)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-20">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="w-10 h-10 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-lg font-heading mx-auto mb-3">
            FH
          </span>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            {step === 'form' ? 'Create an Account' : 'Verify Your Gmail'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === 'form'
              ? 'Join the verified FreelanceHub commercial network'
              : 'Verify your email to activate your account via Keycloak SMTP'}
          </p>
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <>
            {/* Role Selector Tabs */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Register As
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

            <form onSubmit={handleInitiateRegister} method="POST" action="#" autoComplete="on" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-first-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    First Name *
                  </label>
                  <input
                    id="reg-first-name"
                    name="given-name"
                    autoComplete="given-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label htmlFor="reg-last-name" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Last Name *
                  </label>
                  <input
                    id="reg-last-name"
                    name="family-name"
                    autoComplete="family-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Username *
                </label>
                <input
                  id="reg-username"
                  name="username"
                  autoComplete="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  id="reg-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  A verification code will be sent to this email via Keycloak SMTP.
                </span>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    name="new-password"
                    autoComplete="new-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-3 pr-10 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <input
                  id="reg-confirm-password"
                  name="confirm-password"
                  autoComplete="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
              </div>

              <Button
                variant="secondary"
                size="lg"
                type="submit"
                isLoading={loading}
                className="w-full justify-center mt-2"
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Create Account & Verify Email
              </Button>
            </form>
          </>
        )}

        {/* Step 2: Gmail OTP Verification */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-center">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-slate-600">
                Verification code sent to:
              </p>
              <div className="mt-1 font-semibold text-sm text-slate-900 font-mono flex items-center justify-center gap-1.5">
                <span>{emailInfo?.maskedEmail}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Delivered via Keycloak SMTP Service
              </p>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3 text-xs text-emerald-800 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {emailInfo?.emailWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-2.5 text-xs text-amber-800">
                {emailInfo.emailWarning}
              </div>
            )}

            {/* Dev Mode Helper */}
            {emailInfo?.devOtp && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-md p-2.5 text-xs text-indigo-900 flex items-center justify-between">
                <span>
                  <strong>Dev Helper:</strong> OTP code is <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-indigo-200">{emailInfo.devOtp}</code>
                </span>
                <button
                  type="button"
                  onClick={() => setOtpInput(emailInfo.devOtp || '')}
                  className="text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Autofill
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    6-Digit Security Code *
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className={expirySeconds <= 60 ? 'text-rose-600 font-bold' : ''}>
                      {expirySeconds > 0 ? formatTimer(expirySeconds) : 'Expired'}
                    </span>
                  </div>
                </div>

                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  value={otpInput}
                  onChange={handleOtpChange}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full px-3 py-3 text-center tracking-[0.5em] text-2xl font-mono font-bold border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] text-slate-900"
                />
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  Check your Gmail inbox and spam folders for the verification code.
                </p>
              </div>

              <Button
                variant="secondary"
                size="lg"
                type="submit"
                isLoading={loading}
                disabled={otpInput.length !== 6 || expirySeconds <= 0}
                className="w-full justify-center mt-2"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Verify Email & Activate Account
              </Button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('form')
                    setErrorMsg(null)
                    setSuccessMsg(null)
                  }}
                  className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Edit Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || resending}
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${
                    cooldown > 0 || resending
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-[#2563EB] hover:underline cursor-pointer'
                  }`}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                  <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend Code'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="text-[#2563EB] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Keycloak SMTP & Identity Provider Verified</span>
          </div>
        </div>
      </div>
    </div>
  )
}
