import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { projectService, type Project } from '../../services/projectService'
import { StatCard } from '../../components/common/StatCard'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Briefcase,
  PlusCircle,
  FileCheck,
  CreditCard,
  Building2,
  Users,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

export const ClientDashboard: React.FC = () => {
  const { username } = usePortal()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadClientData() {
      try {
        setLoading(true)
        setError(null)
        const data = await projectService.getMyProjects(0, 20)
        if (mounted) {
          setProjects(data.projects)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve projects.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadClientData()
    return () => {
      mounted = false
    }
  }, [])

  const openProjects = projects.filter((p) => p.status === 'OPEN')
  const inProgressProjects = projects.filter((p) => p.status === 'IN_PROGRESS')
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED')
  const totalCommitted = projects
    .filter((p) => p.status === 'IN_PROGRESS' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.budget || 0), 0)

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200 mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Client Workspace</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Client Control Center, {username}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your project scopes, evaluate contractor proposals, and track milestone execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/client/projects/new">
            <Button variant="secondary" size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Post a Project
            </Button>
          </Link>
          <Link to="/client/freelancers">
            <Button variant="outline" size="sm" leftIcon={<Users className="w-4 h-4" />}>
              Browse Talent
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Projects"
          value={loading ? '...' : openProjects.length}
          icon={Briefcase}
          color="blue"
          subtitle="Accepting proposals"
        />
        <StatCard
          label="In Execution"
          value={loading ? '...' : inProgressProjects.length}
          icon={FileCheck}
          color="amber"
          subtitle="Active contract milestones"
        />
        <StatCard
          label="Completed Projects"
          value={loading ? '...' : completedProjects.length}
          icon={FileCheck}
          color="green"
          subtitle="Delivered contracts"
        />
        <StatCard
          label="Committed Capital"
          value={loading ? '...' : `$${totalCommitted.toLocaleString()}`}
          icon={CreditCard}
          color="primary"
          subtitle="Allocated to contracts"
        />
      </div>

      {/* Projects List */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold font-heading text-slate-900">
            My Posted Projects
          </h2>
          <Link
            to="/client/projects"
            className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
          >
            <span>View all projects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {projects.slice(0, 5).map((project) => (
              <div key={project.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={getStatusBadgeVariant(project.status)}>
                      {project.status}
                    </Badge>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {project.currency} {project.budget.toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/client/projects/${project.id}/proposals`}>
                    <Button size="sm" variant="outline">
                      Proposals
                    </Button>
                  </Link>
                  <Link to={`/client/projects/${project.id}/edit`}>
                    <Button size="sm" variant="ghost">
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No projects posted yet"
            description="Create your first project brief to begin receiving structured proposals from verified freelancers."
            actionLabel="Post a Project"
            onAction={() => {
              window.location.href = '/client/projects/new'
            }}
          />
        )}
      </div>
    </div>
  )
}
