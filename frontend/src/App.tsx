import { useState } from 'react'
import './App.css'
import AuthButtons from './AuthButtons'
import CreateProject from './CreateProject'
import OpenProjects from './OpenProjects'
import MyProjects from './MyProjects'
import MyProposals from './MyProposals'
import { keycloak } from './auth'

function App() {
  const signedIn = Boolean(keycloak.authenticated)
  const [projectsRefresh, setProjectsRefresh] = useState(0)

  function refreshProjects() {
    setProjectsRefresh((value) => value + 1)
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
            <a href="#how-it-works">How it works</a>
            <AuthButtons />
          </nav>
        </header>

        <main>
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

              <a
                  className="primary-link"
                  href={signedIn ? '#projects' : '#getting-started'}
              >
                Find your next opportunity
                <span aria-hidden="true">↗</span>
              </a>

              <p className="hero-note">
                Clear proposals. Direct decisions. Work that moves.
              </p>
            </div>

            <aside className="editorial-panel" aria-label="Our approach">
              <div className="panel-top">
                <span>THE WAY WE WORK</span>
                <span aria-hidden="true">01 / 03</span>
              </div>

              <div className="panel-message">
              <span className="editorial-symbol" aria-hidden="true">
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

          {signedIn && (
              <>
                <CreateProject onCreated={refreshProjects} />

                <OpenProjects key={`open-${projectsRefresh}`} />

                <MyProjects
                    key={`mine-${projectsRefresh}`}
                    onChanged={refreshProjects}
                />

                <MyProposals />
              </>
          )}

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
                {signedIn
                    ? 'Post a project, explore opportunities, and keep track of your proposals.'
                    : 'Sign in to explore projects and manage your work.'}
              </p>
            </div>

            {signedIn ? (
                <a className="primary-link" href="#projects">
                  Browse projects
                  <span aria-hidden="true">↗</span>
                </a>
            ) : (
                <AuthButtons />
            )}
          </section>
        </main>

        <footer className="site-footer">
          <span>FreelanceHub</span>
          <span>Built around good work.</span>
        </footer>
      </div>
  )
}

export default App