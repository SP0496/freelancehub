import React, { useEffect, useState } from 'react'
import { proposalService, type Proposal } from '../../services/proposalService'
import { StatCard } from '../../components/common/StatCard'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Wallet,
  Coins,
  ShieldCheck,
  Download,
  AlertCircle,
  Clock,
} from 'lucide-react'

export const EarningsPage: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadEarnings() {
      try {
        setLoading(true)
        setError(null)
        const data = await proposalService.getMyProposals(0, 50)
        if (mounted) {
          setProposals(data.proposals)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve earnings records.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadEarnings()
    return () => {
      mounted = false
    }
  }, [])

  const acceptedContracts = proposals.filter((p) => p.status === 'ACCEPTED')
  const totalEarned = acceptedContracts.reduce((sum, p) => sum + (p.proposedAmount || 0), 0)
  const pendingSubmissions = proposals
    .filter((p) => p.status === 'SUBMITTED')
    .reduce((sum, p) => sum + (p.proposedAmount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow & Revenue Management</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Earnings & Financial Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time calculation of contracted revenue, escrow-protected milestone balances, and payment disbursement records.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert('Exporting statement as CSV...')}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Statement
        </Button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Contracted Revenue"
          value={loading ? '...' : `$${totalEarned.toLocaleString()}`}
          icon={Wallet}
          color="green"
          subtitle="From accepted contracts"
        />
        <StatCard
          label="Escrow Secured"
          value={loading ? '...' : `$${totalEarned.toLocaleString()}`}
          icon={Coins}
          color="blue"
          subtitle="Locked by client upon award"
        />
        <StatCard
          label="Pending Pipeline"
          value={loading ? '...' : `$${pendingSubmissions.toLocaleString()}`}
          icon={Clock}
          color="amber"
          subtitle="From submitted proposals"
        />
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h2 className="text-base font-bold font-heading text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Contract Revenue Ledger
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : acceptedContracts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Contract / Proposal ID</th>
                  <th className="py-3 px-4">Scope Summary</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Escrow Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {acceptedContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      #{contract.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {contract.coverLetter}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      ${contract.proposedAmount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="success">Secured in Escrow</Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Viewing receipt for contract #${contract.id.slice(0, 8)}`)}
                        className="text-[#2563EB] font-semibold hover:underline"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Coins}
            title="No financial transactions recorded yet"
            description="Revenue ledger entries are automatically generated when clients accept your project proposals and fund escrow."
            actionLabel="View Proposals"
            onAction={() => {
              window.location.href = '/freelancer/proposals'
            }}
          />
        )}
      </div>
    </div>
  )
}
