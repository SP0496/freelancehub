import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Bookmark, ArrowRight, Trash2 } from 'lucide-react'

export const SavedProjectsPage: React.FC = () => {
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fh_saved_projects')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function loadSaved() {
      try {
        setLoading(true)
        if (savedIds.length === 0) {
          setProjects([])
          return
        }
        const data = await projectService.getOpenProjects(0, 50)
        if (mounted) {
          const matched = data.projects.filter((p) => savedIds.includes(p.id))
          setProjects(matched)
        }
      } catch {
        // fallback
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadSaved()
    return () => {
      mounted = false
    }
  }, [savedIds])

  const handleRemove = (id: string) => {
    const nextSaved = savedIds.filter((savedId) => savedId !== id)
    setSavedIds(nextSaved)
    localStorage.setItem('fh_saved_projects', JSON.stringify(nextSaved))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Shortlist</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Saved Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Projects you bookmarked to research scope and prepare proposals.
          </p>
        </div>

        <Link to="/freelancer/projects">
          <Button variant="secondary" size="sm">
            Browse All Projects
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant="success">{project.status}</Badge>
                  <button
                    type="button"
                    onClick={() => handleRemove(project.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold font-heading text-slate-900 line-clamp-1 mb-2">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                  {project.description}
                </p>
              </div>

              <div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                      Budget
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-sm">
                      {project.currency} {project.budget.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link to={`/freelancer/projects/${project.id}`} className="block">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-center"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Submit Proposal
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved projects"
          description="Bookmark interesting projects while browsing the marketplace to review specifications and submit proposals later."
          actionLabel="Explore Projects"
          onAction={() => {
            window.location.href = '/freelancer/projects'
          }}
        />
      )}
    </div>
  )
}
