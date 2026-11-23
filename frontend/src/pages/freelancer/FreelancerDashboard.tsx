import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { StatCard } from '../../components/common/StatCard'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { proposalService, type Proposal } from '../../services/proposalService'
import { projectService, type Project } from '../../services/projectService'
import {
  Send,
  FileCheck,
  Wallet,
  Compass,
  ArrowRight,
  UserCheck,
  Clock,
  AlertCircle,
} from 'lucide-react'

export const FreelancerDashboard: React.FC = () => {
  const { username, avatarUrl } = usePortal()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [openProjects, setOpenProjects] = useState<Project[]>([])
  const [totalOpenCount, setTotalOpenCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadDashboardData() {
      try {
        setLoading(true)
        setError(null)
        const [proposalsData, projectsData] = await Promise.all([
          proposalService.getMyProposals(0, 10),
          projectService.getOpenProjects(0, 5),
        ])
        if (mounted) {
          setProposals(proposalsData.proposals)
          setOpenProjects(projectsData.projects)
          setTotalOpenCount(projectsData.totalElements)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadDashboardData()
    return () => {
      mounted = false
    }
  }, [])

  const activeProposals = proposals.filter((p) => p.status === 'SUBMITTED')
  const acceptedContracts = proposals.filter((p) => p.status === 'ACCEPTED')
  const pipelineValue = proposals
    .filter((p) => p.status === 'SUBMITTED' || p.status === 'ACCEPTED')
    .reduce((sum, p) => sum + (p.proposedAmount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/freelancer/profile" title="Profile Settings" className="shrink-0 relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={username}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 ring-2 ring-transparent group-hover:ring-[#2563EB]/30 transition-all shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg font-heading group-hover:bg-blue-50 group-hover:text-[#2563EB] transition-colors">
                {username.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </Link>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Freelancer Workspace</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Welcome back, {username}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track your submitted proposals, active contracts, and available marketplace opportunities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/freelancer/projects">
            <Button variant="secondary" size="sm" leftIcon={<Compass className="w-4 h-4" />}>
              Find Projects
            </Button>
          </Link>
          <Link to="/freelancer/profile">
            <Button variant="outline" size="sm">
              Edit Profile
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
          label="Active Proposals"
          value={loading ? '...' : activeProposals.length}
          icon={Send}
          color="blue"
          subtitle="Pending client review"
        />
        <StatCard
          label="Won Contracts"
          value={loading ? '...' : acceptedContracts.length}
          icon={FileCheck}
          color="green"
          subtitle="Accepted proposals"
        />
        <StatCard
          label="Pipeline Value"
          value={loading ? '...' : `$${pipelineValue.toLocaleString()}`}
          icon={Wallet}
          color="amber"
          subtitle="Submitted & accepted total"
        />
        <StatCard
          label="Marketplace Projects"
          value={loading ? '...' : totalOpenCount}
          icon={Compass}
          color="primary"
          subtitle="Open for proposal submission"
        />
      </div>

      {/* Main Grid: Recent Proposals & Live Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Proposals */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold font-heading text-slate-900">
                Recent Proposal Submissions
              </h2>
              <Link
                to="/freelancer/proposals"
                className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : proposals.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {proposals.slice(0, 5).map((proposal) => (
                  <div key={proposal.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getStatusBadgeVariant(proposal.status)}>
                          {proposal.status}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-900 font-mono">
                          ${proposal.proposedAmount.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400">· {proposal.deliveryDays} days</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-1">
                        {proposal.coverLetter}
                      </p>
                    </div>

                    <Link
                      to={`/freelancer/projects/${proposal.projectId}`}
                      className="text-xs font-medium text-[#2563EB] hover:underline whitespace-nowrap"
                    >
                      View Project
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Send}
                title="No proposals submitted yet"
                description="Explore open projects in the marketplace to find matching scopes and submit your terms."
                actionLabel="Browse Projects"
                onAction={() => {
                  window.location.href = '/freelancer/projects'
                }}
              />
            )}
          </div>
        </div>

        {/* Right Column: Newly Posted Projects */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold font-heading text-slate-900">
                Open Projects
              </h2>
              <Link
                to="/freelancer/projects"
                className="text-xs font-semibold text-[#2563EB] hover:underline flex items-center gap-1"
              >
                <span>Browse</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-16 bg-slate-100 rounded-md animate-pulse" />
                ))}
              </div>
            ) : openProjects.length > 0 ? (
              <div className="space-y-3">
                {openProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-md border border-slate-200 hover:border-slate-300 transition-colors bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900 line-clamp-1">
                        {project.title}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 font-mono whitespace-nowrap">
                        {project.currency} {project.budget.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Open</span>
                      </span>
                      <Link
                        to={`/freelancer/projects/${project.id}`}
                        className="text-[#2563EB] font-semibold hover:underline"
                      >
                        Submit Proposal
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No open projects right now.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
