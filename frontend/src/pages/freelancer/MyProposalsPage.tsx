import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { proposalService, type Proposal } from '../../services/proposalService'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Send,
  AlertCircle,
  ExternalLink,
  Ban,
  Clock,
  Coins,
} from 'lucide-react'

export const MyProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | 'SUBMITTED' | 'ACCEPTED' | 'WITHDRAWN'>('ALL')
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null)

  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let ignore = false
    async function fetchProposals() {
      try {
        setError(null)
        const data = await proposalService.getMyProposals(0, 50)
        if (!ignore) {
          setProposals(data.proposals)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve proposals.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    void fetchProposals()
    return () => {
      ignore = true
    }
  }, [refreshKey])

  const handleWithdraw = async (projectId: string, proposalId: string, version: number) => {
    if (!window.confirm('Are you sure you want to withdraw this proposal? This cannot be undone.')) {
      return
    }

    try {
      setWithdrawingId(proposalId)
      await proposalService.withdrawProposal(projectId, proposalId, version)
      setRefreshKey((k) => k + 1)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to withdraw proposal.')
    } finally {
      setWithdrawingId(null)
    }
  }

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'ALL') return true
    return p.status === activeTab
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <Send className="w-3.5 h-3.5" />
            <span>Proposal Registry</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            My Submitted Proposals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track evaluation status, deliverables commitments, and contract conversions.
          </p>
        </div>

        <Link to="/freelancer/projects">
          <Button variant="secondary" size="sm">
            Find New Opportunities
          </Button>
        </Link>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        {(['ALL', 'SUBMITTED', 'ACCEPTED', 'WITHDRAWN'] as const).map((tab) => {
          const count =
            tab === 'ALL'
              ? proposals.length
              : proposals.filter((p) => p.status === tab).length
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600">
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProposals.length > 0 ? (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
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
                    Proposal ID: {proposal.id.slice(0, 8)}...
                  </span>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Cover Letter Excerpt
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap">
                    {proposal.coverLetter}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <strong className="text-slate-900 font-mono text-sm">
                      ${proposal.proposedAmount.toLocaleString()}
                    </strong>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{proposal.deliveryDays} estimated days</span>
                  </span>
                </div>
              </div>

              {/* Action column */}
              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link to={`/freelancer/projects/${proposal.projectId}`}>
                  <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    View Project
                  </Button>
                </Link>

                {proposal.status === 'SUBMITTED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    isLoading={withdrawingId === proposal.id}
                    onClick={() =>
                      void handleWithdraw(proposal.projectId, proposal.id, proposal.version)
                    }
                    leftIcon={<Ban className="w-3.5 h-3.5" />}
                  >
                    Withdraw
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Send}
          title="No proposals in this category"
          description="Browse open client projects in the marketplace to submit proposals and win new contracts."
          actionLabel="Explore Projects"
          onAction={() => {
            window.location.href = '/freelancer/projects'
          }}
        />
      )}
    </div>
  )
}
