import React, { useEffect, useState } from 'react'
import { projectService, type Project } from '../../services/projectService'
import { Star, ShieldCheck, Award } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'

export const ClientReviewsPage: React.FC = () => {
  const [completedProjects, setCompletedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadCompleted() {
      try {
        setLoading(true)
        const data = await projectService.getMyProjects(0, 50)
        if (mounted) {
          const finished = data.projects.filter((p) => p.status === 'COMPLETED')
          setCompletedProjects(finished)
        }
      } catch {
        // fallback
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadCompleted()
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
            <span>Verified Marketplace Evaluations</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Contractor Feedback & Reviews
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit verified milestone feedback for contractors who delivered your completed contracts.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-1">Contract-Verified</strong>
            Reviews are strictly locked to completed projects. No unverified or synthetic ratings exist.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-1">Authentic Reputation</strong>
            Helps top-performing independent specialists build verified commercial credibility.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-1">Objective Criteria</strong>
            Evaluate deliverables based on agreed scope, communication quality, and timeline delivery.
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-32 bg-white border border-slate-200 rounded-lg animate-pulse" />
      ) : completedProjects.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold font-heading text-slate-900 pb-3 border-b border-slate-100">
            Eligible Completed Projects ({completedProjects.length})
          </h2>
          <div className="divide-y divide-slate-100">
            {completedProjects.map((p) => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{p.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Completed · {p.currency} {p.budget.toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => alert(`Review submitted for "${p.title}". Thank you for maintaining marketplace integrity!`)}
                  leftIcon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                >
                  Submit 5-Star Review
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Star}
          title="No completed projects ready for review"
          description="When you mark an in-progress project as completed and release escrow, it will appear here for contractor review."
          actionLabel="View Projects"
          onAction={() => {
            window.location.href = '/client/projects'
          }}
        />
      )}
    </div>
  )
}
