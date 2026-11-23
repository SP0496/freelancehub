import { useState } from 'react'
import AuthButtons from './AuthButtons'
import CreateProject from './CreateProject'
import OpenProjects from './OpenProjects'
import MyProjects from './MyProjects'
import MyProposals from './MyProposals'
import MyProfile from './MyProfile'
import { keycloak } from './auth'
import {
  Compass,
  Briefcase,
  Send,
  PlusCircle,
  User,
  ArrowUpRight,
  Zap,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

type WorkspaceView =
    | 'browse'
    | 'my-projects'
    | 'my-proposals'
    | 'create'
    | 'profile'

const workspaceLinks: {
  view: WorkspaceView
  label: string
  icon: typeof Compass
}[] = [
  { view: 'browse', label: 'Browse projects', icon: Compass },
  { view: 'my-projects', label: 'My projects', icon: Briefcase },
  { view: 'my-proposals', label: 'My proposals', icon: Send },
  { view: 'create', label: 'Post a project', icon: PlusCircle },
  { view: 'profile', label: 'My profile', icon: User },
]

function App() {
  const signedIn = Boolean(keycloak.authenticated)
  const [activeView, setActiveView] = useState<WorkspaceView>('browse')
  const [projectsRefresh, setProjectsRefresh] = useState(0)

  const username = String(
      keycloak.tokenParsed?.preferred_username ?? 'there',
  )

  function refreshProjects() {
    setProjectsRefresh((value) => value + 1)
  }

  function handleProjectCreated() {
    refreshProjects()
    setActiveView('my-projects')
  }

  return (
      <div className="min-h-screen flex flex-col bg-slate-50/50">
        {/* Sticky Glassmorphic Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
            <a href="/" className="inline-flex items-center gap-2.5 font-bold text-lg text-slate-900 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-serif text-xl italic font-bold shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                f.
              </span>
              <span className="font-heading font-extrabold tracking-tight text-xl">
                Freelance<span className="text-emerald-600">Hub</span>
              </span>
            </a>

            <nav className="flex items-center gap-6" aria-label="Main navigation">
              {!signedIn && (
                  <a
                      href="#how-it-works"
                      className="hidden sm:inline-block text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors"
                  >
                    How it works
                  </a>
              )}

              <AuthButtons />
            </nav>
          </div>
        </header>

        {/* Main Content Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {signedIn ? (
              <div className="space-y-8">
                {/* Workspace Header */}
                <header className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
                      <Sparkles className="w-3.5 h-3.5" />
                      Your Workspace
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
                      Welcome, <span className="text-emerald-700">{username}</span>.
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                      Explore live client briefs, manage submissions, or commission new projects.
                    </p>
                  </div>

                  {activeView !== 'create' && (
                      <button
                          type="button"
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/25 transition-all self-start md:self-auto cursor-pointer"
                          onClick={() => setActiveView('create')}
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Post a project</span>
                      </button>
                  )}
                </header>

                {/* Workspace Navigation Bar */}
                <nav
                    className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar"
                    aria-label="Workspace navigation"
                >
                  {workspaceLinks.map((link) => {
                    const Icon = link.icon
                    const isActive = activeView === link.view
                    return (
                        <button
                            key={link.view}
                            type="button"
                            aria-current={isActive ? 'page' : undefined}
                            onClick={() => setActiveView(link.view)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                                isActive
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-white bg-transparent'
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{link.label}</span>
                        </button>
                    )
                  })}
                </nav>

                {/* View Container */}
                <div>
                  {activeView === 'browse' && (
                      <OpenProjects key={`open-${projectsRefresh}`} />
                  )}

                  {activeView === 'my-projects' && (
                      <MyProjects
                          key={`mine-${projectsRefresh}`}
                          onChanged={refreshProjects}
                      />
                  )}

                  {activeView === 'my-proposals' && (
                      <MyProposals />
                  )}

                  {activeView === 'create' && (
                      <CreateProject onCreated={handleProjectCreated} />
                  )}

                  {activeView === 'profile' && (
                      <MyProfile />
                  )}
                </div>
              </div>
          ) : (
              <div className="space-y-24 py-8">
                {/* Hero Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center" aria-labelledby="hero-title">
                  <div className="lg:col-span-7 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      The Modern Freelance Marketplace
                    </div>

                    <h1 id="hero-title" className="text-4xl sm:text-5xl lg:text-6xl font-black font-heading text-slate-900 tracking-tight leading-[1.08]">
                      Find your people. <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                      Make great work.
                    </span>
                    </h1>

                    <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                      A straightforward platform to discover verified projects, connect with independent experts, and bring ideas to life without friction.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <a
                          href="#getting-started"
                          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/25 transition-all"
                      >
                        <span>Find your next opportunity</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </a>

                      <a
                          href="#how-it-works"
                          className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-all"
                      >
                        Explore workflow
                      </a>
                    </div>

                    <div className="pt-4 flex items-center gap-6 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Verified Clients
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Direct Milestone Decisions
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Zero Platform Lock-in
                      </span>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="relative p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white shadow-2xl border border-slate-800 space-y-8 overflow-hidden">
                      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none"></div>

                      <div className="flex items-center justify-between text-xs tracking-wider uppercase text-emerald-400 font-bold">
                        <span>The Way We Work</span>
                        <span className="text-slate-500">01 / 03</span>
                      </div>

                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                          <Zap className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-bold font-heading text-white">
                          Less friction. <br />
                          More progress.
                        </h2>
                        <p className="text-sm text-slate-300 leading-relaxed">
                          From the initial proposal to final code handover, keep every requirement clear and every decision transparent.
                        </p>
                      </div>

                      <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Independent talent.</span>
                        <span className="font-semibold text-slate-300">Shared ambition.</span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="space-y-12" aria-labelledby="process-title">
                  <div className="text-center max-w-2xl mx-auto space-y-3">
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Simple 3-Step Process
                    </span>
                    <h2 id="process-title" className="text-3xl font-extrabold font-heading text-slate-900">
                      From an idea to a job well done.
                    </h2>
                    <p className="text-sm text-slate-500">
                      A focused, reliable marketplace workflow built around clarity and speed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-heading font-extrabold text-base">
                        01
                      </div>
                      <h3 className="text-lg font-bold font-heading text-slate-900">Make the brief clear</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Clients post projects with detailed requirements and budget, while freelancers explore matches for their exact skillset.
                      </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-heading font-extrabold text-base">
                        02
                      </div>
                      <h3 className="text-lg font-bold font-heading text-slate-900">Find the right fit</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Submit a considered proposal with delivery days and pricing. Project owners compare pitches and pick their specialist.
                      </p>
                    </div>

                    <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-heading font-extrabold text-base">
                        03
                      </div>
                      <h3 className="text-lg font-bold font-heading text-slate-900">Move work forward</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Track progress from proposal acceptance to milestone completion with full ownership and concurrency protections.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Getting Started Callout */}
                <section
                    id="getting-started"
                    className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-8"
                >
                  <div className="space-y-3">
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                      Ready to Start?
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
                      A place for your best work.
                    </h2>
                    <p className="text-sm text-emerald-100 max-w-md">
                      Sign in through Keycloak to browse open projects, post briefs, or manage your active contracts.
                    </p>
                  </div>

                  <AuthButtons />
                </section>
              </div>
          )}
        </main>

        {/* Site Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-slate-900">FreelanceHub</span>
              <span>— Built for high-trust independent work.</span>
            </div>
            <div>
              <span>React 19 &bull; Spring Boot 4 &bull; MySQL &bull; Keycloak</span>
            </div>
          </div>
        </footer>
      </div>
  )
}

export default App
