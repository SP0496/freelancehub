import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Briefcase, UserCheck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'

export const RoleSelectPage: React.FC = () => {
  const { setPortal, isAuthenticated, login } = usePortal()
  const navigate = useNavigate()

  const handleSelect = (role: 'freelancer' | 'client') => {
    setPortal(role)
    if (isAuthenticated) {
      navigate(role === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard')
    } else {
      // If not authenticated, proceed to login with portal set
      void login()
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Enterprise Marketplace
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 tracking-tight">
          How do you plan to use FreelanceHub?
        </h1>
        <p className="text-sm text-slate-600 mt-3 leading-relaxed">
          Select your primary workspace to tailor your dashboard, workflows, and tools. You can switch between portals at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Freelancer Card */}
        <div
          onClick={() => handleSelect('freelancer')}
          className="bg-white border-2 border-slate-200 hover:border-[#2563EB] rounded-lg p-8 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
              I am a Freelancer
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Find verified projects, submit structured proposals, collaborate with commercial clients, and track earnings.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-8 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Browse real-time open client contracts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Submit tailored proposals with budget milestones</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dedicated earnings and proposal tracking dashboard</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#172B4D] hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
          >
            <span>Continue as Freelancer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Client Card */}
        <div
          onClick={() => handleSelect('client')}
          className="bg-white border-2 border-slate-200 hover:border-[#2563EB] rounded-lg p-8 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between group"
        >
          <div>
            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>

            <h2 className="text-xl font-bold font-heading text-slate-900 mb-2">
              I am a Client
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              Post projects, evaluate qualified proposals, hire specialist talent, manage deliverables, and release payments securely.
            </p>

            <ul className="space-y-2.5 text-xs text-slate-600 mb-8 border-t border-slate-100 pt-6">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Structured 4-step project creation workflow</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Receive and review incoming freelancer proposals</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>One-click proposal acceptance and contract lifecycle</span>
              </li>
            </ul>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            <span>Continue as Client</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
