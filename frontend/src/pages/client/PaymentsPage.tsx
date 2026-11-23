import React, { useEffect, useState } from 'react'
import { projectService, type Project } from '../../services/projectService'
import { StatCard } from '../../components/common/StatCard'
import { Badge } from '../../components/common/Badge'
import { getStatusBadgeVariant } from '../../components/common/badgeUtils'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  CreditCard,
  Coins,
  ShieldCheck,
  Download,
  AlertCircle,
  Clock,
} from 'lucide-react'

export const PaymentsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadFinances() {
      try {
        setLoading(true)
        setError(null)
        const data = await projectService.getMyProjects(0, 50)
        if (mounted) {
          setProjects(data.projects)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve payment records.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadFinances()
    return () => {
      mounted = false
    }
  }, [])

  const activeEscrow = projects
    .filter((p) => p.status === 'IN_PROGRESS')
    .reduce((sum, p) => sum + (p.budget || 0), 0)

  const disbursedTotal = projects
    .filter((p) => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + (p.budget || 0), 0)

  const openAllocated = projects
    .filter((p) => p.status === 'OPEN')
    .reduce((sum, p) => sum + (p.budget || 0), 0)

  const transactions = projects.filter(
    (p) => p.status === 'IN_PROGRESS' || p.status === 'COMPLETED'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Escrow & Invoicing</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Payments & Escrow Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit-ready escrow tracking, milestone allocations, and disbursement receipts for contractor contracts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => alert('Downloading tax summary as PDF...')}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Download Financial Audit
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
          label="Active Escrow Hold"
          value={loading ? '...' : `$${activeEscrow.toLocaleString()}`}
          icon={Coins}
          color="amber"
          subtitle="Locked for in-progress projects"
        />
        <StatCard
          label="Settled Disbursements"
          value={loading ? '...' : `$${disbursedTotal.toLocaleString()}`}
          icon={CreditCard}
          color="green"
          subtitle="Released upon milestone completion"
        />
        <StatCard
          label="Committed Open Scope"
          value={loading ? '...' : `$${openAllocated.toLocaleString()}`}
          icon={Clock}
          color="blue"
          subtitle="Budget allocated to open projects"
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h2 className="text-base font-bold font-heading text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Escrow Allocation History
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded animate-pulse" />
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project ID</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Escrow State</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                      #{tx.id.slice(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {tx.title}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                      {tx.currency} {tx.budget.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(tx.status)}>
                        {tx.status === 'COMPLETED' ? 'Settled & Released' : 'Locked in Escrow'}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Generating receipt for Project #${tx.id.slice(0, 8)}`)}
                        className="text-[#2563EB] font-semibold hover:underline"
                      >
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={CreditCard}
            title="No escrow transactions recorded yet"
            description="When you accept proposals, milestone escrow allocations will be automatically recorded here for auditing."
            actionLabel="View Projects"
            onAction={() => {
              window.location.href = '/client/projects'
            }}
          />
        )}
      </div>
    </div>
  )
}
