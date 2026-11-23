import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-base font-heading">
                FH
              </span>
              <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">
                Freelance<span className="text-[#2563EB]">Hub</span>
              </span>
            </Link>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enterprise freelance marketplace connecting vetted independent talent with growing businesses. Built on modern microservices and standards-compliant OAuth2 authentication.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Contracts</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Keycloak SSO</span>
              </span>
            </div>
          </div>

          {/* Freelancer col */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">For Freelancers</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/freelancer/projects" className="hover:text-[#2563EB] transition-colors">
                  Browse Open Projects
                </Link>
              </li>
              <li>
                <Link to="/freelancer/proposals" className="hover:text-[#2563EB] transition-colors">
                  Track Proposals
                </Link>
              </li>
              <li>
                <Link to="/freelancer/earnings" className="hover:text-[#2563EB] transition-colors">
                  Earnings & Invoicing
                </Link>
              </li>
              <li>
                <Link to="/freelancer/profile" className="hover:text-[#2563EB] transition-colors">
                  Professional Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Client col */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">For Clients</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/client/projects/new" className="hover:text-[#2563EB] transition-colors">
                  Post a Project
                </Link>
              </li>
              <li>
                <Link to="/client/projects" className="hover:text-[#2563EB] transition-colors">
                  Manage Projects
                </Link>
              </li>
              <li>
                <Link to="/client/freelancers" className="hover:text-[#2563EB] transition-colors">
                  Browse Freelancers
                </Link>
              </li>
              <li>
                <Link to="/client/payments" className="hover:text-[#2563EB] transition-colors">
                  Escrow & Payments
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance col */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal & Security</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <Link to="/privacy" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
                  <span>Privacy Policy</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-[#2563EB] transition-colors flex items-center gap-1">
                  <span>Terms & Conditions</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Enterprise SLA: Tier 1</span>
              </li>
              <li>
                <span className="text-slate-400">API Gateway v1.0</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 FreelanceHub Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-700">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-700">Terms</Link>
            <a href="#support" className="hover:text-slate-700">Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
