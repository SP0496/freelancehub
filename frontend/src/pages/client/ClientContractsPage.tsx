import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  FileCheck,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'

export const ClientContractsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false
    async function fetchContracts() {
      try {
        setError(null)
        const data = await projectService.getMyProjects(0, 50)
        if (!ignore) {
          const activeContracts = data.projects.filter(
            (p) => p.status === 'IN_PROGRESS' || p.status === 'COMPLETED'
          )
          setProjects(activeContracts)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve contracts.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    void fetchContracts()
    return () => {
      ignore = true
    }
  }, [refreshKey])

  const handleCompleteContract = async (project: Project) => {
    if (!window.confirm(`Release escrow funds and complete contract for "${project.title}"?`)) {
      return
    }
    try {
      setCompletingId(project.id)
      await projectService.completeProject(project.id, project.version ?? 0)
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to complete contract.')
    } finally {
      setCompletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Awarded Engagements</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Active & Completed Contracts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track deliverables, manage escrow releases, and communicate with awarded talent.
          </p>
        </div>

        <Link to="/client/payments">
          <Button variant="outline" size="sm">
            View Payments & Escrow
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status === 'IN_PROGRESS' ? 'IN EXECUTION' : project.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Contract #{project.id.slice(0, 8)}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 mb-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Contract Value
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-sm flex items-center gap-1 mt-0.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      {project.currency} {project.budget.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Escrow State
                    </span>
                    <span className="text-emerald-700 font-semibold mt-0.5 inline-block">
                      {project.status === 'COMPLETED' ? 'Disbursed to Talent' : 'Locked in Escrow'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link to={`/client/projects/${project.id}/proposals`}>
                  <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View Details
                  </Button>
                </Link>

                <Link to="/client/messages">
                  <Button size="sm" variant="ghost" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                    Chat
                  </Button>
                </Link>

                {project.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    isLoading={completingId === project.id}
                    onClick={() => void handleCompleteContract(project)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Release Escrow
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck}
          title="No active contracts"
          description="Contracts are automatically generated when you accept a proposal on one of your posted projects."
          actionLabel="View My Projects"
          onAction={() => {
            window.location.href = '/client/projects'
          }}
        />
      )}
    </div>
  )
}
