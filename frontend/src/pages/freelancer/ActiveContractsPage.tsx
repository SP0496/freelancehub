import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { proposalService, type Proposal } from '../../services/proposalService'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  FileCheck,
  Coins,
  Clock,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'

export const ActiveContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchContracts() {
      try {
        setLoading(true)
        setError(null)
        const data = await proposalService.getMyProposals(0, 50)
        if (mounted) {
          const accepted = data.proposals.filter((p) => p.status === 'ACCEPTED')
          setContracts(accepted)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve contracts.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void fetchContracts()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Binding Agreements</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Active Contracts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Contracts initiated through accepted proposals with guaranteed milestone escrow.
          </p>
        </div>

        <Link to="/freelancer/earnings">
          <Button variant="outline" size="sm">
            View Earnings & Escrow
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
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : contracts.length > 0 ? (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge variant="success">IN EXECUTION</Badge>
                  <span className="text-xs text-slate-400 font-mono">
                    Contract #{contract.id.slice(0, 8)}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded p-4 text-xs text-slate-700">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Agreed Scope Excerpt
                  </span>
                  <p className="leading-relaxed line-clamp-2">
                    {contract.coverLetter}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Contract Value
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-sm flex items-center gap-1 mt-0.5">
                      <Coins className="w-4 h-4 text-emerald-600" />
                      ${contract.proposedAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Delivery Window
                    </span>
                    <span className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {contract.deliveryDays} Days
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Milestone Escrow
                    </span>
                    <span className="text-emerald-700 font-semibold mt-0.5 inline-block">
                      Funded in Escrow
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <Link to={`/freelancer/projects/${contract.projectId}`}>
                  <Button size="sm" variant="outline" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                    Project Brief
                  </Button>
                </Link>

                <Link to="/freelancer/messages">
                  <Button size="sm" variant="secondary" leftIcon={<MessageSquare className="w-3.5 h-3.5" />}>
                    Client Chat
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FileCheck}
          title="No active contracts"
          description="When a client accepts your proposal, the project is officially awarded and will appear here with contract details."
          actionLabel="Browse Open Projects"
          onAction={() => {
            window.location.href = '/freelancer/projects'
          }}
        />
      )}
    </div>
  )
}
