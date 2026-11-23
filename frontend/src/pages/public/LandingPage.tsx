import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Compass,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
  Layers,
  Coins,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Badge } from '../../components/common/Badge'
import { projectService, type Project } from '../../services/projectService'

export const LandingPage: React.FC = () => {
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    let mounted = true
    projectService
      .getOpenProjects()
      .then((data) => {
        if (mounted) {
          setRecentProjects(data.projects.slice(0, 3))
          setIsLoadingProjects(false)
        }
      })
      .catch(() => {
        if (mounted) {
          setIsLoadingProjects(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [])

  const faqs = [
    {
      q: 'How does authentication work on FreelanceHub?',
      a: 'FreelanceHub integrates with Keycloak IAM using OpenID Connect (OIDC) and OAuth 2.0. All tokens are automatically refreshed, and requests through the API Gateway are cryptographically validated.',
    },
    {
      q: 'How do proposals and hiring work?',
      a: 'Freelancers submit proposals detailing their cover letter, estimated duration, and budget. Clients review proposals directly in the Client Portal and can accept a proposal with one click to initiate project execution.',
    },
    {
      q: 'Can a user participate as both a client and a freelancer?',
      a: 'Yes. FreelanceHub features a dual-portal architecture. You can switch seamlessly between the Freelancer Portal and Client Portal from the navigation bar without logging out.',
    },
    {
      q: 'What backend architecture powers the platform?',
      a: 'FreelanceHub is built on a resilient Spring Boot microservices backend featuring a Spring Cloud Gateway, Keycloak Identity Service, Eureka Discovery, and dedicated User and Marketplace domain services.',
    },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-xs font-semibold text-[#2563EB] mb-6">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Production-Grade Marketplace Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-slate-900 tracking-tight leading-tight">
              Enterprise Freelance Marketplace for High-Impact Projects.
            </h1>

            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              Connect directly with verified independent contractors or manage commercial projects with structured proposals, milestone tracking, and enterprise-grade security.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to="/select-role">
                <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Get Started
                </Button>
              </Link>
              <Link to="/freelancer/projects">
                <Button variant="outline" size="lg" leftIcon={<Compass className="w-4 h-4" />}>
                  Explore Open Projects
                </Button>
              </Link>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero fake reviews or metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#2563EB] shrink-0" />
                <span>Keycloak OIDC Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-slate-700 shrink-0" />
                <span>Reactive API Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Marketplace Highlights (Authentic Data) */}
      <section className="py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                Live Opportunities
              </span>
              <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight mt-1">
                Recent Projects Seeking Proposals
              </h2>
            </div>
            <Link
              to="/freelancer/projects"
              className="text-xs font-semibold text-[#2563EB] hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-100 rounded w-2/3 mb-6" />
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-6 shadow-xs flex flex-col justify-between transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <Badge variant="success">Open for Proposals</Badge>
                      <span className="text-xs text-slate-700 font-mono font-semibold">
                        {p.currency} {p.budget.toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{p.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-slate-400">Fixed Budget</span>
                    <Link
                      to={`/freelancer/projects/${p.id}`}
                      className="text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center max-w-md mx-auto">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-700">No projects currently posted</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Be the first client to publish an enterprise project scope.
              </p>
              <Link to="/client/projects/new">
                <Button size="sm" variant="secondary">
                  Post a Project
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Dual Portal Architecture Overview */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              Architecture & Workflows
            </span>
            <h2 className="text-3xl font-bold font-heading text-slate-900 tracking-tight mt-1">
              Engineered for Both Sides of the Market
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              FreelanceHub separates concerns between hiring clients and delivering specialists with dedicated portals, tools, and telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Freelancer Flow */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-8">
              <div className="w-10 h-10 rounded-md bg-blue-100 text-[#2563EB] flex items-center justify-center font-bold text-base mb-6">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">
                The Freelancer Workflow
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Purpose-built tools for independent engineers, designers, and specialists to find work and get paid predictably.
              </p>

              <ol className="space-y-4 text-xs text-slate-700">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-[#172B4D] font-bold flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    <strong>Discover Real Projects:</strong> Browse verified projects with explicit budget ranges and timeline parameters.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-[#172B4D] font-bold flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    <strong>Submit Structured Proposals:</strong> Present your methodology, timeline, and exact financial terms.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-[#172B4D] font-bold flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    <strong>Track Deliverables & Earnings:</strong> Manage accepted proposals and track revenue through real-time dashboards.
                  </div>
                </li>
              </ol>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link to="/freelancer/dashboard">
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Enter Freelancer Portal
                  </Button>
                </Link>
              </div>
            </div>

            {/* Client Flow */}
            <div className="bg-[#F8FAFC] border border-slate-200 rounded-lg p-8">
              <div className="w-10 h-10 rounded-md bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-base mb-6">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 mb-2">
                The Client Workflow
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Structured procurement workflows to define technical briefs, receive proposals, and hire with confidence.
              </p>

              <ol className="space-y-4 text-xs text-slate-700">
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                    1
                  </span>
                  <div>
                    <strong>Define the Project Scope:</strong> Use the 4-step wizard to outline deliverables, budget bounds, and deadlines.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                    2
                  </span>
                  <div>
                    <strong>Evaluate Contractor Proposals:</strong> Review submissions side-by-side with duration estimates and rates.
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold flex items-center justify-center text-[10px] shrink-0">
                    3
                  </span>
                  <div>
                    <strong>Award & Manage Contract:</strong> Accept proposals to lock in deliverables and track progress to completion.
                  </div>
                </li>
              </ol>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <Link to="/client/dashboard">
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    Enter Client Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security & Infrastructure Pillars */}
      <section className="py-16 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
              Technical Standards
            </span>
            <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight mt-1">
              Production-Grade Reliability & Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <Lock className="w-6 h-6 text-[#2563EB] mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Keycloak Identity</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized OAuth 2.0 and OIDC authentication with proactive token refresh cycles.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <Server className="w-6 h-6 text-emerald-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Spring Cloud Gateway</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reactive reverse-proxy dispatching verified requests to microservice boundaries.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <Coins className="w-6 h-6 text-amber-600 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">Audit-Ready Finance</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every project and proposal state transition is recorded for auditability and compliance.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <Layers className="w-6 h-6 text-slate-700 mb-3" />
              <h4 className="text-sm font-bold text-slate-900 mb-1">RFC 7807 Errors</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standardized problem details parsing providing clean user-facing error explanations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 sm:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              Everything you need to know about the FreelanceHub marketplace platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-lg overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-xs font-bold text-slate-900">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 bg-[#172B4D] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-heading tracking-tight mb-4">
            Ready to experience an authentic marketplace?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed mb-8">
            Join enterprise clients and independent specialists delivering verified projects worldwide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/select-role">
              <Button variant="secondary" size="lg">
                Select Your Workspace
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="border-slate-500 text-white hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
