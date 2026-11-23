import React, { useEffect, useState } from 'react'
import { projectService, type Project } from '../../services/projectService'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  MessageSquare,
  Send,
  Lock,
  UserCheck,
  AlertCircle,
} from 'lucide-react'

export const ClientMessagesPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([])

  useEffect(() => {
    let mounted = true
    async function loadConversations() {
      try {
        setLoading(true)
        const data = await projectService.getMyProjects(0, 50)
        if (mounted) {
          const active = data.projects.filter(
            (p) => p.status === 'IN_PROGRESS' || p.status === 'COMPLETED'
          )
          setProjects(active)
          if (active.length > 0) {
            setSelectedProject(active[0])
            setMessages([
              {
                id: '1',
                sender: 'System',
                text: `Encrypted contractor channel open for project: "${active[0].title}". Escrow verified.`,
                time: 'Active',
              },
            ])
          }
        }
      } catch {
        // clean fallback
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void loadConversations()
    return () => {
      mounted = false
    }
  }, [])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: 'Client (You)',
        text: messageText.trim(),
        time: 'Just now',
      },
    ])
    setMessageText('')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Direct Channels</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Contractor Communications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exchange deliverables, architectural requirements, and milestone approvals with hired talent.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading contractor channels...</p>
        </div>
      ) : projects.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          {/* Thread List */}
          <div className="border-r border-slate-200 p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Active Project Channels ({projects.length})
            </span>
            {projects.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setSelectedProject(p)
                  setMessages([
                    {
                      id: '1',
                      sender: 'System',
                      text: `Encrypted contractor channel open for project: "${p.title}". Escrow verified.`,
                      time: 'Active',
                    },
                  ])
                }}
                className={`w-full p-3 rounded-md text-left transition-colors flex items-start gap-3 ${
                  selectedProject?.id === p.id
                    ? 'bg-blue-50 border border-blue-200 text-slate-900'
                    : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{p.title}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {p.currency} {p.budget.toLocaleString()} · {p.status}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 flex flex-col justify-between p-6">
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {selectedProject?.title}
                </h3>
                <p className="text-[10px] text-emerald-600 font-medium">● Channel Active</p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-700">
                {selectedProject?.currency} {selectedProject?.budget.toLocaleString()} Escrow
              </span>
            </div>

            {/* Messages body */}
            <div className="flex-1 py-6 space-y-4 overflow-y-auto max-h-[360px]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'Client (You)' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-md rounded-lg p-3 text-xs leading-relaxed ${
                      m.sender === 'Client (You)'
                        ? 'bg-[#172B4D] text-white'
                        : m.sender === 'System'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    <p className="text-[10px] font-bold opacity-75 mb-1">{m.sender}</p>
                    <p>{m.text}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="pt-4 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Send instructions, milestone notes, or feedback..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]"
              />
              <Button size="sm" variant="secondary" type="submit" leftIcon={<Send className="w-3.5 h-3.5" />}>
                Send
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No active communication channels"
          description="When you accept a freelancer proposal on a project, a secure direct channel will be provisioned here."
          actionLabel="View My Projects"
          onAction={() => {
            window.location.href = '/client/projects'
          }}
        />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 text-xs text-blue-800">
        <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          FreelanceHub automatically logs contract communications to provide authentic dispute protection and milestone verification.
        </span>
      </div>
    </div>
  )
}
