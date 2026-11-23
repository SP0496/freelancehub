import React, { useState } from 'react'
import { FolderGit2, Plus, ExternalLink, Trash2 } from 'lucide-react'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'

interface PortfolioItem {
  id: string
  title: string
  description: string
  skills: string[]
  liveUrl?: string
  repoUrl?: string
}

export const PortfolioPage: React.FC = () => {
  const [items, setItems] = useState<PortfolioItem[]>(() => {
    try {
      const stored = localStorage.getItem('fh_freelancer_portfolio')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  const [showAddForm, setShowAddForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [liveUrl, setLiveUrl] = useState('')
  const [repoUrl, setRepoUrl] = useState('')

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return

    const newItem: PortfolioItem = {
      id: String(Date.now()),
      title: title.trim(),
      description: description.trim(),
      skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      liveUrl: liveUrl.trim() || undefined,
      repoUrl: repoUrl.trim() || undefined,
    }

    const nextItems = [newItem, ...items]
    setItems(nextItems)
    localStorage.setItem('fh_freelancer_portfolio', JSON.stringify(nextItems))

    setTitle('')
    setDescription('')
    setSkills('')
    setLiveUrl('')
    setRepoUrl('')
    setShowAddForm(false)
  }

  const handleDeleteItem = (id: string) => {
    const nextItems = items.filter((i) => i.id !== id)
    setItems(nextItems)
    localStorage.setItem('fh_freelancer_portfolio', JSON.stringify(nextItems))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Showcase & Credentials</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            My Professional Portfolio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Showcase verified case studies, technical deliverables, and open-source contributions to prospective clients.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowAddForm((prev) => !prev)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {showAddForm ? 'Close Form' : 'Add Project Case Study'}
        </Button>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
          <h2 className="text-base font-bold font-heading text-slate-900 mb-4 pb-3 border-b border-slate-100">
            Add Portfolio Project
          </h2>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Distributed Payment Reconciliation Engine"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Executive Summary & Technical Architecture *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe project challenges, technologies utilized, scale, and concrete business outcomes..."
                className="w-full p-3 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Skills / Tags (comma-separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="Java, Spring Boot, React, Kafka, Docker"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Live Project URL (Optional)
                </label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Repository URL (Optional)
                </label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" size="sm">
                Save to Portfolio
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Items Grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-bold font-heading text-slate-900">{item.title}</h3>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">
                  {item.description}
                </p>

                {item.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-4 text-xs">
                {item.liveUrl && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2563EB] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Live Demo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {item.repoUrl && (
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Source Code</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderGit2}
          title="No portfolio projects added yet"
          description="Build credibility with clients by adding your past projects, technical architecture summaries, and repository links."
          actionLabel="Add Project Case Study"
          onAction={() => setShowAddForm(true)}
        />
      )}
    </div>
  )
}
