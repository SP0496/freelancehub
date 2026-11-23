import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { projectService, type Project } from '../../services/projectService'
import { Button } from '../../components/common/Button'
import {
  Edit3,
  ArrowLeft,
  Save,
  AlertCircle,
  Coins,
} from 'lucide-react'

export const EditProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState<number | ''>('')

  useEffect(() => {
    if (!id) return
    let mounted = true
    async function loadProject() {
      try {
        setLoading(true)
        setError(null)
        const data = await projectService.getProjectById(id as string)
        if (mounted) {
          setProject(data)
          setTitle(data.title)
          setDescription(data.description)
          setBudget(data.budget)
        }
      } catch (err: unknown) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to retrieve project details.')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadProject()
    return () => {
      mounted = false
    }
  }, [id])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !project) return

    if (!title.trim() || title.trim().length < 5) {
      setError('Title must be at least 5 characters long.')
      return
    }
    if (!description.trim() || description.trim().length < 20) {
      setError('Description must be at least 20 characters long.')
      return
    }
    if (!budget || Number(budget) <= 0) {
      setError('Budget must be a positive number.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await projectService.updateProject(id, {
        title: title.trim(),
        description: description.trim(),
        budget: Number(budget),
        version: project.version ?? 0,
      })
      navigate('/client/projects')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update project.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white border border-slate-200 rounded-lg p-8 animate-pulse space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-100 rounded w-full" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          to="/client/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to My Projects</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
          <Edit3 className="w-3.5 h-3.5" />
          <span>Modify Scope</span>
        </div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
          Edit Project Specification
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Update the title, scope description, or budget allocation for this project.
        </p>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-center gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Project Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Scope & Deliverables *
          </label>
          <textarea
            rows={8}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Project Budget ({project?.currency || 'USD'}) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
            <input
              type="number"
              required
              min={1}
              step="any"
              value={budget}
              onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
              className="w-full pl-7 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Version {project?.version}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/client/projects">
              <Button type="button" variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="secondary"
              size="sm"
              isLoading={saving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
