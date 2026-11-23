import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  Compass,
  Search,
  Filter,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

export const BrowseProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [minBudget, setMinBudget] = useState<string>('')
  const [maxBudget, setMaxBudget] = useState<string>('')

  // Saved projects in localStorage
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('fh_saved_projects')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    let ignore = false
    async function fetchProjects() {
      try {
        setError(null)
        const data = await projectService.getOpenProjects(page, 9)
        if (!ignore) {
          setProjects(data.projects)
          setTotalPages(data.totalPages || 1)
          setTotalElements(data.totalElements || 0)
          setPage(data.page || 0)
        }
      } catch (err: unknown) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve open projects.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    void fetchProjects()
    return () => {
      ignore = true
    }
  }, [page])

  const toggleSave = (projectId: string) => {
    let nextSaved: string[]
    if (savedIds.includes(projectId)) {
      nextSaved = savedIds.filter((id) => id !== projectId)
    } else {
      nextSaved = [...savedIds, projectId]
    }
    setSavedIds(nextSaved)
    localStorage.setItem('fh_saved_projects', JSON.stringify(nextSaved))
  }

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesMin = minBudget === '' || p.budget >= Number(minBudget)
    const matchesMax = maxBudget === '' || p.budget <= Number(maxBudget)

    return matchesSearch && matchesMin && matchesMax
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Project Marketplace</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
              Explore Available Projects
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse real client opportunities verified and open for proposal submission ({totalElements} total).
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Min budget ($)"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>

          <div>
            <input
              type="number"
              placeholder="Max budget ($)"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Project Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
              <div className="h-6 bg-slate-200 rounded w-1/3 pt-4" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const isSaved = savedIds.includes(project.id)
            return (
              <div
                key={project.id}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-lg p-6 shadow-xs flex flex-col justify-between transition-colors group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="success">{project.status}</Badge>
                    <button
                      type="button"
                      onClick={() => toggleSave(project.id)}
                      className={`p-1 rounded text-slate-400 hover:text-slate-700 transition-colors ${
                        isSaved ? 'text-blue-600 hover:text-blue-700' : ''
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save project'}
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-[#2563EB]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-[#2563EB] transition-colors line-clamp-1 mb-2">
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
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                        Engagement
                      </span>
                      <span className="text-slate-600 font-medium">Fixed Milestone</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/freelancer/projects/${project.id}`} className="flex-1">
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
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Filter}
          title="No matching projects found"
          description="Try broadening your search query or adjusting your budget limits to explore all active opportunities."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('')
            setMinBudget('')
            setMaxBudget('')
          }}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between text-xs">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 0 || loading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-slate-600 font-medium">
            Page {page + 1} of {totalPages}
          </span>

          <Button
            size="sm"
            variant="outline"
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage((p) => p + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
