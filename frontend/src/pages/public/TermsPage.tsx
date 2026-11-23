import React from 'react'
import { ShieldCheck, Scale, AlertTriangle, FileCode, CheckCircle2, Ban } from 'lucide-react'

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="mb-10 pb-6 border-b border-slate-200">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Enterprise Service Agreement
        </span>
        <h1 className="text-3xl font-bold font-heading text-slate-900 tracking-tight">
          Terms and Conditions
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Effective Date: January 1, 2026 · Platform Terms Version 2.4
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <Scale className="w-5 h-5 text-[#2563EB]" />
            <h2>1. Platform Marketplace Role</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            FreelanceHub operates as a marketplace platform facilitating independent commercial relationships between Clients and Freelancers. FreelanceHub is not an employment agency, employer, joint venture partner, or direct contractor. Freelancers operate as independent business entities who determine their own rates, schedules, and methods of execution.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />
            <h2>2. User Representations and Commitments</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            By creating an account and engaging on FreelanceHub, you represent and warrant that:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>All profile information, professional qualifications, portfolio items, and business representations are accurate and truthful.</li>
            <li>Clients possess authorized financial means to fund posted projects upon proposal acceptance.</li>
            <li>Freelancers possess the necessary licensing, technical capability, and legal capacity to deliver agreed milestones.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <FileCode className="w-5 h-5 text-[#2563EB]" />
            <h2>3. Intellectual Property Rights</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unless otherwise agreed in a separate written contract between Client and Freelancer: upon full and final payment for a completed project or milestone, all intellectual property rights, title, and ownership in custom deliverables transfer to the Client. The Freelancer retains pre-existing proprietary tools, libraries, or methodologies, and grants the platform a non-exclusive license to display non-confidential deliverables in their professional portfolio.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <Ban className="w-5 h-5 text-rose-600" />
            <h2>4. Strictly Prohibited Conduct</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Users agree not to engage in any of the following activities:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>Circumventing platform payment workflows or attempting to solicit off-platform transactions to avoid marketplace fees.</li>
            <li>Submitting automated, deceptive, or duplicate spam proposals or posting non-genuine projects.</li>
            <li>Harassing, discriminating against, or defaming other marketplace participants.</li>
            <li>Automated scraping, crawling, or stress-testing of FreelanceHub APIs without explicit written consent.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2>5. Account Suspension and Limitation of Liability</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            FreelanceHub reserves the right to suspend or terminate accounts that breach these Terms. To the maximum extent permitted by applicable law, FreelanceHub shall not be liable for indirect, incidental, special, consequential, or punitive damages arising out of contract disputes, delayed deliverables, or platform maintenance windows.
          </p>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-4">
            For legal service or compliance notifications: <span className="text-slate-800 font-mono">legal@freelancehub.local</span>.
          </p>
        </section>
      </div>
    </div>
  )
}
