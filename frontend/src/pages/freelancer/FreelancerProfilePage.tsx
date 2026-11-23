import React, { useEffect, useState } from 'react'
import { userService } from '../../services/userService'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../../components/common/Button'
import {
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react'

export const FreelancerProfilePage: React.FC = () => {
  const { username, email, sub } = usePortal()
  const [displayName, setDisplayName] = useState('')
  const [headline, setHeadline] = useState('')
  const [skills, setSkills] = useState('Full-Stack Engineering, TypeScript, React, Java')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchProfile() {
      try {
        setLoading(true)
        setErrorMsg(null)
        const profile = await userService.getMyProfile()
        if (mounted) {
          setDisplayName(profile.displayName || '')
          setHeadline(profile.headline || '')
        }
      } catch {
        // If 404, user has not created profile entity yet; initialize with username
        if (mounted) {
          setDisplayName(username)
          setHeadline('Independent Software Specialist')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void fetchProfile()
    return () => {
      mounted = false
    }
  }, [username])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setErrorMsg('Display name cannot be empty.')
      return
    }

    try {
      setSaving(true)
      setErrorMsg(null)
      setSuccessMsg(null)
      await userService.updateMyProfile({
        displayName: displayName.trim(),
        headline: headline.trim() || null,
      })
      setSuccessMsg('Profile updated successfully.')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile Identity</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Freelancer Profile Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your public presentation and verified credentials shown to clients.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
            Public Credentials
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                disabled={loading}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                disabled={loading}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Distributed Systems & Cloud Architect"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Displayed prominently alongside your proposal submissions.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Core Competencies & Skills
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Java, Spring Cloud, PostgreSQL, Docker, React"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          </div>
        </div>

        {/* Keycloak SSO Details (Read-only) */}
        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Keycloak Authentication Details (Immutable)</span>
          </h2>
          <p className="text-[11px] text-slate-500 mb-4">
            These identity claims are securely managed by the central Keycloak OpenID Connect service.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-md p-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Username
              </span>
              <span className="font-semibold text-slate-800 font-mono">{username}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Email Address
              </span>
              <span className="font-semibold text-slate-800 font-mono">{email || 'Managed via Keycloak'}</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Keycloak Subject ID (sub)
              </span>
              <span className="text-[11px] text-slate-600 font-mono break-all">{sub || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-end">
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            isLoading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
