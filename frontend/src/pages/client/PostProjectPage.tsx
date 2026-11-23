import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { projectService } from '../../services/projectService'
import { Button } from '../../components/common/Button'
import {
  PlusCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Coins,
  ShieldCheck,
} from 'lucide-react'

export const PostProjectPage: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Form Fields
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Software Engineering')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState<number | ''>('')
  const [currency] = useState('USD')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    setError(null)
    if (step === 1) {
      if (!title.trim() || title.trim().length < 5) {
        setError('Please enter a descriptive project title (minimum 5 characters).')
        return
      }
    } else if (step === 2) {
      if (!description.trim() || description.trim().length < 20) {
        setError('Please provide a detailed specification (minimum 20 characters).')
        return
      }
    } else if (step === 3) {
      if (!budget || Number(budget) <= 0) {
        setError('Please specify a positive budget amount.')
        return
      }
    }
    setStep((prev) => (Math.min(4, prev + 1) as 1 | 2 | 3 | 4))
  }

  const handleBack = () => {
    setError(null)
    setStep((prev) => (Math.max(1, prev - 1) as 1 | 2 | 3 | 4))
  }

  const handlePublish = async () => {
    try {
      setSubmitting(true)
      setError(null)
      await projectService.createProject({
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
      })
      navigate('/client/projects')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to publish project.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Procurement Wizard</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Post a New Project
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define deliverables and budget parameters to receive structured proposals from verified talent.
        </p>

        {/* Multi-step progress indicator */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-slate-100">
          {[
            { num: 1, label: 'Basics' },
            { num: 2, label: 'Specification' },
            { num: 3, label: 'Budget' },
            { num: 4, label: 'Review' },
          ].map((item) => (
            <div key={item.num} className="text-center">
              <div
                className={`h-1.5 rounded-full mb-2 transition-colors ${
                  step >= item.num ? 'bg-[#2563EB]' : 'bg-slate-200'
                }`}
              />
              <span
                className={`text-[11px] font-semibold block ${
                  step === item.num ? 'text-[#2563EB]' : 'text-slate-400'
                }`}
              >
                Step {item.num}: {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Form Cards */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-2">
              Step 1: Project Basics
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Build Microservice Architecture for Payment Gateway"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Be specific about the core objective and technical domain.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary Domain Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="Software Engineering">Software Engineering & Backend</option>
                <option value="Frontend Development">Frontend & UI/UX</option>
                <option value="DevOps & Cloud">DevOps & Cloud Architecture</option>
                <option value="Data & Analytics">Data Engineering & Analytics</option>
                <option value="Cybersecurity">Cybersecurity & Compliance</option>
              </select>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-2">
              Step 2: Scope & Deliverables
            </h2>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Detailed Scope Description *
              </label>
              <textarea
                rows={8}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key responsibilities, deliverables, required tech stack, acceptance criteria, and integration parameters..."
                className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Minimum 20 characters ({description.length} entered). Clear briefs attract higher quality proposals.
              </span>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-2">
              Step 3: Budget & Financial Terms
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Allocated Project Budget (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 5000"
                  className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-xs text-slate-600 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 font-semibold">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span>Milestone-Based Escrow Protection</span>
              </div>
              <p className="leading-relaxed">
                Budget funds are only committed when you formally accept a freelancer's proposal. Funds remain secured in escrow until deliverables are inspected.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-base font-bold font-heading text-slate-900 mb-2">
              Step 4: Review Project Brief
            </h2>

            <div className="bg-slate-50 border border-slate-200 rounded-md p-5 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Title
                </span>
                <span className="text-sm font-bold text-slate-900">{title}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Category
                </span>
                <span className="text-slate-700">{category}</span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Allocated Budget
                </span>
                <span className="text-emerald-700 font-bold font-mono text-base">
                  {currency} {Number(budget).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Scope Summary
                </span>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed mt-1">
                  {description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Project will be published directly to the verified FreelanceHub marketplace.</span>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <Link to="/client/projects">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
          )}

          {step < 4 ? (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleNext}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={submitting}
              onClick={handlePublish}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Publish Project
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
