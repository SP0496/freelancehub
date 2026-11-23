import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { proposalService, type Proposal } from '../../services/proposalService'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Users,
  ArrowLeft,
  Coins,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'

export const ProjectProposalsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!id) return
    let ignore = false
    async function loadData() {
      try {
        setError(null)
        const [projData, propData] = await Promise.all([
          projectService.getProjectById(id as string),
          proposalService.getProjectProposals(id as string, 0, 50),
        ])
        if (!ignore) {
          setProject(projData)
          setProposals(propData.proposals)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to load project proposals.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    void loadData()
    return () => {
      ignore = true
    }
  }, [id, refreshKey])

  const handleAcceptProposal = async (proposal: Proposal) => {
    if (!project) return
    const confirmMsg = `Accept proposal for $${proposal.proposedAmount.toLocaleString()}? This will award the contract and transition project to IN_PROGRESS.`
    if (!window.confirm(confirmMsg)) return

    try {
      setAcceptingId(proposal.id)
      await proposalService.acceptProposal(project.id, proposal.id, {
        projectVersion: project.version ?? 0,
        proposalVersion: proposal.version,
      })
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to accept proposal.')
    } finally {
      setAcceptingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/client/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Projects</span>
        </Link>
      </div>

      {/* Project Overview Card */}
      {project && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={getStatusBadgeVariant(project.status)}>{project.status}</Badge>
              <span className="text-xs text-slate-400 font-mono">
                Project #{project.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
              Proposals for "{project.title}"
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review candidate methodology, terms, and delivery schedules before awarding contract.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-md p-3 sm:text-right shrink-0">
            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
              Allocated Budget
            </span>
            <span className="text-lg font-bold text-emerald-700 font-mono">
              {project.currency} {project.budget.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Proposals List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-heading text-slate-900">
            Received Submissions ({proposals.length})
          </h2>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-3 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : proposals.length > 0 ? (
          proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant={getStatusBadgeVariant(proposal.status)}>
                    {proposal.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Proposal #{proposal.id.slice(0, 8)}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs text-slate-700">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Technical Methodology & Approach
                  </span>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {proposal.coverLetter}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <strong className="text-slate-900 font-mono text-sm">
                      ${proposal.proposedAmount.toLocaleString()}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{proposal.deliveryDays} estimated delivery days</span>
                  </span>
                </div>
              </div>

              {/* Action column */}
              <div className="shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                {proposal.status === 'SUBMITTED' && project?.status === 'OPEN' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={acceptingId === proposal.id}
                    onClick={() => void handleAcceptProposal(proposal)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Accept & Hire
                  </Button>
                )}

                {proposal.status === 'ACCEPTED' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Awarded Contract</span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Users}
            title="No proposals received yet"
            description="Your project is open in the marketplace. Qualified freelancers will submit proposals shortly."
          />
        )}
      </div>
    </div>
  )
}
