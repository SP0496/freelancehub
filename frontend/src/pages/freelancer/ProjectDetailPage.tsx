import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { proposalService } from '../../services/proposalService'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Coins,
  Send,
  Lock,
} from 'lucide-react'

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Proposal Form State
  const [coverLetter, setCoverLetter] = useState('')
  const [proposedAmount, setProposedAmount] = useState<number | ''>('')
  const [deliveryDays, setDeliveryDays] = useState<number | ''>('')
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function fetchProject() {
      try {
        setLoading(true)
        setError(null)
        const data = await projectService.getProjectById(id as string)
        if (mounted) {
          setProject(data)
          setProposedAmount(data.budget)
          setDeliveryDays(14)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve project details.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void fetchProject()
    return () => {
      mounted = false
    }
  }, [id])

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !project) return

    if (!coverLetter.trim() || coverLetter.trim().length < 20) {
      setSubmitError('Cover letter must be at least 20 characters long.')
      return
    }
    if (!proposedAmount || Number(proposedAmount) <= 0) {
      setSubmitError('Please provide a valid positive proposed budget.')
      return
    }
    if (!deliveryDays || Number(deliveryDays) < 1) {
      setSubmitError('Delivery estimate must be at least 1 day.')
      return
    }

    try {
      setSubmitting(true)
      setSubmitError(null)
      await proposalService.createProposal(id, {
        coverLetter: coverLetter.trim(),
        proposedAmount: Number(proposedAmount),
        deliveryDays: Number(deliveryDays),
      })
      setSubmitSuccess(true)
      setCoverLetter('')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit proposal.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <div className="bg-white border border-slate-200 rounded-lg p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-5/6" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
          <h2 className="text-base font-bold text-rose-900">Project Not Found</h2>
          <p className="text-xs text-rose-700 mt-1 mb-4">{error || 'Unable to locate the specified project.'}</p>
          <Link to="/freelancer/projects">
            <Button size="sm" variant="outline">
              Back to Open Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/freelancer/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={project.status === 'OPEN' ? 'success' : 'neutral'}>
                {project.status}
              </Badge>
              <span className="text-xs text-slate-400">Project ID: {project.id}</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 sm:text-right shrink-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Client Budget
            </span>
            <span className="text-xl font-bold text-emerald-700 font-mono">
              {project.currency} {project.budget.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
            Project Specification & Deliverables
          </h2>
          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
            {project.description}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Escrow Protected Milestone</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#2563EB]" />
            <span>Keycloak Authorized Client</span>
          </div>
        </div>
      </div>

      {/* Proposal Submission Section */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold font-heading text-slate-900">
            Submit Your Proposal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Specify your technical approach, timeline, and exact financial terms for client review.
          </p>
        </div>

        {submitSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-md p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-900">Proposal Submitted Successfully!</h3>
            <p className="text-xs text-emerald-700 mt-1 mb-4">
              Your proposal has been logged and transmitted to the project owner for evaluation.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/freelancer/proposals">
                <Button size="sm" variant="secondary">
                  View My Proposals
                </Button>
              </Link>
              <Link to="/freelancer/projects">
                <Button size="sm" variant="outline">
                  Browse More Projects
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitProposal} className="space-y-5">
            {submitError && (
              <div className="bg-rose-50 border border-rose-200 rounded-md p-3.5 flex items-center gap-2.5 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{submitError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Cover Letter & Technical Approach *
              </label>
              <textarea
                rows={5}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Outline how you will execute this project, relevant experience, architecture decisions, and milestones..."
                className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                Minimum 20 characters ({coverLetter.length} characters entered).
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Proposed Amount ({project.currency}) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={proposedAmount}
                  onChange={(e) => setProposedAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Client posted budget: {project.currency} {project.budget.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Estimated Delivery (Days) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Estimated business days from proposal acceptance.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link to="/freelancer/projects">
                <Button variant="ghost" size="sm" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                type="submit"
                isLoading={submitting}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Proposal
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
