import React, { useState } from 'react'
import { HelpCircle, BookOpen, ShieldAlert, Mail, ChevronDown, ChevronUp } from 'lucide-react'

export const ClientHelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const faqs = [
    {
      q: 'How does milestone escrow work?',
      a: 'When you accept a freelancer proposal, the agreed budget is held in escrow. The freelancer executes the work, and funds are only disbursed once you inspect the deliverables and click "Complete Project".',
    },
    {
      q: 'Can I cancel an open project?',
      a: 'Yes. As long as a project is in OPEN status and no proposals have been accepted, you can cancel it with one click from your My Projects page.',
    },
    {
      q: 'How do I review incoming proposals?',
      a: 'Navigate to "My Projects" and click "Proposals" next to any open project. You can inspect candidate methodology, delivery schedules, and proposed budgets before awarding.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Procurement Support</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Client Knowledge Base & Assistance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Guidance on posting effective project briefs, evaluating candidate proposals, and managing escrow milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <BookOpen className="w-6 h-6 text-[#2563EB] mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Effective Project Scopes</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Provide clear acceptance criteria, repository architectures, and milestone deliverables to attract senior specialists.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <ShieldAlert className="w-6 h-6 text-amber-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Dispute Resolution</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All work delivered through FreelanceHub is covered by escrow arbitration. Maintain deliverables inside the project channel for dispute verification.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <Mail className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Enterprise Advisory</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Need customized billing, enterprise SLAs, or assistance scoping large projects? Contact our solutions team at <span className="font-mono text-slate-800">enterprise@freelancehub.local</span>.
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
