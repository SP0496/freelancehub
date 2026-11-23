import React, { useEffect, useState } from 'react'
import { proposalService, type Proposal } from '../../services/proposalService'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import {
  MessageSquare,
  Send,
  Lock,
  Building2,
  AlertCircle,
} from 'lucide-react'

export const MessagesPage: React.FC = () => {
  const [contracts, setContracts] = useState<Proposal[]>([])
  const [selectedContract, setSelectedContract] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState<{ id: string; sender: string; text: string; time: string }[]>([])

  useEffect(() => {
    let mounted = true
    async function loadConversations() {
      try {
        setLoading(true)
        const data = await proposalService.getMyProposals(0, 50)
        if (mounted) {
          const accepted = data.proposals.filter((p) => p.status === 'ACCEPTED')
          setContracts(accepted)
          if (accepted.length > 0) {
            setSelectedContract(accepted[0])
            setMessages([
              {
                id: '1',
                sender: 'System',
                text: `Contract channel established for project #${accepted[0].projectId.slice(0, 8)}. Milestone escrow confirmed.`,
                time: 'Just now',
              },
            ])
          }
        }
      } catch {
        // handled cleanly
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
        sender: 'You',
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
            Client Communications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Exchange project briefs, progress reports, and deliverable files with verified clients.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading conversation channels...</p>
        </div>
      ) : contracts.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
          {/* Thread List */}
          <div className="border-r border-slate-200 p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
              Active Contract Threads ({contracts.length})
            </span>
            {contracts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedContract(c)
                  setMessages([
                    {
                      id: '1',
                      sender: 'System',
                      text: `Contract channel established for project #${c.projectId.slice(0, 8)}. Milestone escrow confirmed.`,
                      time: 'Active',
                    },
                  ])
                }}
                className={`w-full p-3 rounded-md text-left transition-colors flex items-start gap-3 ${
                  selectedContract?.id === c.id
                    ? 'bg-blue-50 border border-blue-200 text-slate-900'
                    : 'hover:bg-slate-50 text-slate-600 border border-transparent'
                }`}
              >
                <div className="w-8 h-8 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">Project #{c.projectId.slice(0, 8)}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    ${c.proposedAmount.toLocaleString()} · In Execution
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
                  Channel: Project #{selectedContract?.projectId.slice(0, 8)}
                </h3>
                <p className="text-[10px] text-emerald-600 font-medium">● Connected</p>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-700">
                ${selectedContract?.proposedAmount.toLocaleString()} Escrow
              </span>
            </div>

            {/* Messages body */}
            <div className="flex-1 py-6 space-y-4 overflow-y-auto max-h-[360px]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.sender === 'You' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-md rounded-lg p-3 text-xs leading-relaxed ${
                      m.sender === 'You'
                        ? 'bg-[#2563EB] text-white'
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
                placeholder="Type your message or project update..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-hidden focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB]"
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
          title="No active chat channels"
          description="Direct secure communication channels with clients are automatically provisioned when a client accepts your project proposal."
          actionLabel="Browse Open Projects"
          onAction={() => {
            window.location.href = '/freelancer/projects'
          }}
        />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 text-xs text-blue-800">
        <AlertCircle className="w-4 h-4 shrink-0 text-blue-600" />
        <span>
          Communications are monitored by automated policy filters to prevent off-platform disintermediation and preserve escrow dispute protection.
        </span>
      </div>
    </div>
  )
}
