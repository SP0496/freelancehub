import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Briefcase,
  PlusCircle,
  Edit3,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export const MyProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('ALL')
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false
    async function fetchProjects() {
      try {
        setError(null)
        const data = await projectService.getMyProjects(0, 50)
        if (!ignore) {
          setProjects(data.projects)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve your projects.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    void fetchProjects()
    return () => {
      ignore = true
    }
  }, [refreshKey])

  const handleComplete = async (project: Project) => {
    if (!window.confirm(`Mark project "${project.title}" as completed? This will release escrow.`)) {
      return
    }
    try {
      setActionInProgressId(project.id)
      await projectService.completeProject(project.id, project.version ?? 0)
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to complete project.')
    } finally {
      setActionInProgressId(null)
    }
  }

  const handleCancel = async (project: Project) => {
    if (!window.confirm(`Cancel project "${project.title}"? Open proposals will be invalidated.`)) {
      return
    }
    try {
      setActionInProgressId(project.id)
      await projectService.cancelProject(project.id, project.version ?? 0)
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to cancel project.')
    } finally {
      setActionInProgressId(null)
    }
  }

  const filteredProjects = projects.filter((p) => {
    if (activeTab === 'ALL') return true
    return p.status === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Procurement Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            My Posted Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee project lifecycle, evaluate incoming proposals, and transition contract milestones.
          </p>
        </div>

        <Link to="/client/projects/new">
          <Button variant="secondary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
            Post a Project
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold overflow-x-auto pb-px">
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((tab) => {
          const count =
            tab === 'ALL'
              ? projects.length
              : projects.filter((p) => p.status === tab).length
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.replace('_', ' ')}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Projects list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="space-y-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant={getStatusBadgeVariant(project.status)}>
                    {project.status}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {project.id.slice(0, 8)}...
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono ml-auto md:ml-0">
                    {project.currency} {project.budget.toLocaleString()}
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
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link to={`/client/projects/${project.id}/proposals`}>
                  <Button size="sm" variant="secondary" leftIcon={<Users className="w-3.5 h-3.5" />}>
                    Proposals
                  </Button>
                </Link>

                {project.status === 'OPEN' && (
                  <Link to={`/client/projects/${project.id}/edit`}>
                    <Button size="sm" variant="outline" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                  </Link>
                )}

                {project.status === 'IN_PROGRESS' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-700 hover:bg-emerald-50"
                    isLoading={actionInProgressId === project.id}
                    onClick={() => void handleComplete(project)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Complete
                  </Button>
                )}

                {project.status === 'OPEN' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    isLoading={actionInProgressId === project.id}
                    onClick={() => void handleCancel(project)}
                    leftIcon={<XCircle className="w-3.5 h-3.5" />}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No projects in this category"
          description="Create a new project scope to start receiving proposals from qualified professionals."
          actionLabel="Post a Project"
          onAction={() => {
            window.location.href = '/client/projects/new'
          }}
        />
      )}
    </div>
  )
}
