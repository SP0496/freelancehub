import React from 'react'
import { ShieldCheck, Lock, FileText, UserCheck, Eye, Database } from 'lucide-react'

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="mb-10 pb-6 border-b border-slate-200">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Legal & Compliance
        </span>
        <h1 className="text-3xl font-bold font-heading text-slate-900 tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500 mt-2">
          Effective Date: January 1, 2026 · Last Updated: November 2026
        </p>
      </div>

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed">
        {/* Section 1 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <FileText className="w-5 h-5 text-[#2563EB]" />
            <h2>1. Information We Collect</h2>
          </div>
          <p className="mb-3 text-xs text-slate-600">
            FreelanceHub collects information necessary to maintain a secure and compliant marketplace between independent contractors and commercial clients:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>
              <strong>Account Information:</strong> Full name, verified email address, username, and authentication tokens provided through our Keycloak Identity Management provider.
            </li>
            <li>
              <strong>Profile & Professional Information:</strong> Display name, professional headline, skills inventory, rate expectations, and portfolio submissions.
            </li>
            <li>
              <strong>Project & Proposal Data:</strong> Project scopes, budget boundaries, deliverables, duration estimates, cover letters, and contract milestone specifications.
            </li>
            <li>
              <strong>Financial & Transactional Records:</strong> Milestone records, accepted project budgets, escrow allocations, and transaction history.
            </li>
            <li>
              <strong>Technical & Session Data:</strong> IP addresses, browser fingerprint, API gateway audit logs, and authentication token lifecycle timestamps.
            </li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <Database className="w-5 h-5 text-[#2563EB]" />
            <h2>2. How We Use Collected Data</h2>
          </div>
          <p className="mb-3 text-xs text-slate-600">
            We process your information strictly for legitimate commercial and operational purposes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>To match clients with qualified freelancers based on explicit project requirements.</li>
            <li>To record, transition, and complete project contracts and proposal milestones.</li>
            <li>To ensure platform security, prevent unauthorized access, and detect fraudulent submissions.</li>
            <li>To comply with statutory financial accounting and commercial tax reporting obligations.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <Eye className="w-5 h-5 text-[#2563EB]" />
            <h2>3. Local Storage and Session Management</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            FreelanceHub utilizes client-side local storage exclusively for essential operational parameters: active portal mode preference (<code className="text-slate-800 bg-slate-100 px-1 py-0.5 rounded">freelancehub_portal</code>) and OAuth2/OIDC session state management coordinated with Keycloak. We do not use third-party behavioral advertising cookies or cross-site tracking pixels.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <Lock className="w-5 h-5 text-[#2563EB]" />
            <h2>4. Security Safeguards</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Our microservices architecture enforces defense-in-depth principles:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>All transit traffic is protected using Transport Layer Security (TLS 1.3 / HTTPS).</li>
            <li>REST endpoints are protected via an API Gateway validating signed JSON Web Tokens (JWT) on every call.</li>
            <li>Sensitive data at rest is isolated within microservice database boundaries with strict role-based access control (RBAC).</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-white border border-slate-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-base font-heading">
            <UserCheck className="w-5 h-5 text-[#2563EB]" />
            <h2>5. Your Rights and Data Governance</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            In accordance with international privacy regulations (including GDPR and CCPA), you possess the right to:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-xs text-slate-600">
            <li>Access and export your complete profile and transaction history.</li>
            <li>Rectify inaccurate or outdated professional information via Profile Settings.</li>
            <li>Request permanent deletion of your account and disassociation of identifiable records, subject to regulatory retention mandates.</li>
          </ul>
          <p className="text-xs text-slate-500 mt-4 border-t border-slate-100 pt-4">
            For privacy inquiries or data subject requests, please contact our Data Governance Officer at <span className="text-slate-800 font-mono">privacy@freelancehub.local</span>.
          </p>
        </section>
      </div>
    </div>
  )
}
