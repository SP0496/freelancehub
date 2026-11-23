import React from 'react'
import { Star, ShieldCheck, Award } from 'lucide-react'
import { EmptyState } from '../../components/common/EmptyState'

export const ReviewsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Feedback Guarantee</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Reviews & Reputation
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Ratings and qualitative feedback submitted exclusively by commercial clients following milestone contract completion.
          </p>
        </div>
      </div>

      {/* Information Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-1">Contract-Gated Reviews</strong>
            Reviews cannot be purchased or fabricated. Only authenticated clients with closed contracts can submit ratings.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-1">Two-Way Evaluation</strong>
            Both client and freelancer submit feedback upon project completion for transparent mutual reputation.
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block mb-1">Authentic Metrics</strong>
            No synthetic placeholders or mock ratings are displayed in compliance with FreelanceHub integrity guidelines.
          </div>
        </div>
      </div>

      {/* Empty State */}
      <EmptyState
        icon={Star}
        title="No client reviews recorded yet"
        description="Complete accepted contracts with commercial clients to receive verified 5-star milestone ratings and client testimonials."
        actionLabel="View Active Contracts"
        onAction={() => {
          window.location.href = '/freelancer/contracts'
        }}
      />
    </div>
  )
}
