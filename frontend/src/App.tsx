import { useState } from 'react'
import './App.css'
import AuthButtons from './AuthButtons'
import CreateProject from './CreateProject'
import OpenProjects from './OpenProjects'
import MyProjects from './MyProjects'
import MyProposals from './MyProposals'
import MyProfile from './MyProfile'
import { keycloak } from './auth'

type WorkspaceView =
    | 'browse'
    | 'my-projects'
    | 'my-proposals'
    | 'create'
    | 'profile'

const workspaceLinks: {
  view: WorkspaceView
  label: string
}[] = [
  { view: 'browse', label: 'Browse projects' },
  { view: 'my-projects', label: 'My projects' },
  { view: 'my-proposals', label: 'My proposals' },
  { view: 'create', label: 'Post a project' },
  { view: 'profile', label: 'My profile' },
]

function App() {
  const signedIn = Boolean(keycloak.authenticated)
  const [activeView, setActiveView] =
      useState<WorkspaceView>('browse')
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
      <div className="site">
        <header className="site-header">
          <a className="brand" href="/" aria-label="FreelanceHub home">
          <span className="brand-mark" aria-hidden="true">
            f.
          </span>
            FreelanceHub
          </a>

          <nav aria-label="Main navigation">
            {!signedIn && (
                <a href="#how-it-works">How it works</a>
            )}

            <AuthButtons />
          </nav>
        </header>

        <main>
          {signedIn ? (
              <div className="workspace">
                <header className="workspace-heading">
                  <div>
                    <p className="eyebrow">YOUR WORKSPACE</p>
                    <h1 className="workspace-title">
                      Welcome, {username}.
                    </h1>
                    <p className="workspace-description">
                      Find your next opportunity or move your projects forward.
                    </p>
                  </div>

                  {activeView !== 'create' && (
                      <button
                          className="account-button"
                          type="button"
                          onClick={() => setActiveView('create')}
                      >
                        Post a project
                        <span aria-hidden="true"> ↗</span>
                      </button>
                  )}
                </header>

                <nav
                    className="workspace-nav"
                    aria-label="Workspace navigation"
                >
                  {workspaceLinks.map((link) => (
                      <button
                          key={link.view}
                          type="button"
                          className="workspace-nav-button"
                          aria-current={
                            activeView === link.view ? 'page' : undefined
                          }
                          onClick={() => setActiveView(link.view)}
                      >
                        {link.label}
                      </button>
                  ))}
                </nav>

                <div className="workspace-content">
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
              <>
                <section className="hero" aria-labelledby="hero-title">
                  <div className="hero-content">
                    <p className="eyebrow">
                      GOOD WORK STARTS WITH THE RIGHT PEOPLE
                    </p>

                    <h1 id="hero-title">
                      Find your people.
                      <br />
                      Make great work.
                    </h1>

                    <p className="hero-description">
                      A straightforward place to find freelance projects,
                      connect with talent, and move work forward.
                    </p>

                    <a className="primary-link" href="#getting-started">
                      Find your next opportunity
                      <span aria-hidden="true">↗</span>
                    </a>

                    <p className="hero-note">
                      Clear proposals. Direct decisions. Work that moves.
                    </p>
                  </div>

                  <aside
                      className="editorial-panel"
                      aria-label="Our approach"
                  >
                    <div className="panel-top">
                      <span>THE WAY WE WORK</span>
                      <span aria-hidden="true">01 / 03</span>
                    </div>

                    <div className="panel-message">
                  <span
                      className="editorial-symbol"
                      aria-hidden="true"
                  >
                    ↗
                  </span>

                      <h2>
                        Less friction.
                        <br />
                        More progress.
                      </h2>

                      <p>
                        From the first proposal to the final handover,
                        keep the next step clear.
                      </p>
                    </div>

                    <div className="panel-bottom">
                      <span>Independent talent.</span>
                      <span>Shared ambition.</span>
                    </div>
                  </aside>
                </section>

                <section
                    className="process-section"
                    id="how-it-works"
                    aria-labelledby="process-title"
                >
                  <div className="section-heading">
                    <p className="eyebrow">A SIMPLER WAY TO WORK</p>

                    <h2 id="process-title">
                      From an idea to a job well done.
                    </h2>
                  </div>

                  <ol className="process-list">
                    <li>
                      <span className="step-number">01</span>
                      <div>
                        <h3>Make the brief clear</h3>
                        <p>
                          Post a project with its requirements and budget,
                          or explore work that fits your skills.
                        </p>
                      </div>
                    </li>

                    <li>
                      <span className="step-number">02</span>
                      <div>
                        <h3>Find the right fit</h3>
                        <p>
                          Submit a considered proposal or review applications
                          and choose who you want to work with.
                        </p>
                      </div>
                    </li>

                    <li>
                      <span className="step-number">03</span>
                      <div>
                        <h3>Move the work forward</h3>
                        <p>
                          Keep track of your projects and proposals,
                          from acceptance through completion.
                        </p>
                      </div>
                    </li>
                  </ol>
                </section>

                <section className="start-section" id="getting-started">
                  <div>
                    <p className="eyebrow">YOUR NEXT CHAPTER</p>
                    <h2>A place for your best work.</h2>
                    <p>
                      Sign in to explore projects and manage your work.
                    </p>
                  </div>

                  <AuthButtons />
                </section>
              </>
          )}
        </main>

        <footer className="site-footer">
          <span>FreelanceHub</span>
          <span>Built around good work.</span>
        </footer>
      </div>
  )
}

export default App