import React, { useState } from 'react'
import { HelpCircle, BookOpen, ShieldAlert, Mail, ChevronDown, ChevronUp } from 'lucide-react'

export const HelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'When do I get paid for a contract?',
      a: 'When a client accepts your proposal, the contract value is locked into platform escrow. Upon completion and delivery of the agreed scope, the client approves the milestone and funds are released.',
    },
    {
      q: 'Can I edit or withdraw a proposal after submitting?',
      a: 'Yes, as long as the proposal is in SUBMITTED status and has not yet been accepted by the client. You can withdraw your proposal from the My Proposals page.',
    },
    {
      q: 'How are client disputes handled?',
      a: 'If a scope dispute arises, contract deliverables and communications recorded on the platform are evaluated under the FreelanceHub Terms and Conditions by dispute officers.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Support Center</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Freelancer Knowledge Base & Support
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about proposals, escrow milestones, and delivering commercial work.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <BookOpen className="w-6 h-6 text-[#2563EB] mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Proposal Best Practices</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Specify technical milestones, architecture considerations, and realistic delivery estimates to increase acceptance rates.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <ShieldAlert className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Escrow Safety Policy</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never accept payments outside of the FreelanceHub escrow system. Off-platform work voids all dispute resolution protections.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <Mail className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Direct Support</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need assistance with account credentials or API errors? Contact support at <span className="font-mono text-slate-800">support@freelancehub.local</span>.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <h2 className="text-base font-bold font-heading text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Frequently Answered Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div key={idx} className="border border-slate-200 rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-2 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
