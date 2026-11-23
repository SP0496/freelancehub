import React, { useEffect, useState } from 'react'
import { projectService, type Project } from '../../services/projectService'
import { Badge } from '../../components/common/Badge'
import { Button } from '../../components/common/Button'
import { EmptyState } from '../../components/common/EmptyState'
import { Bell, CheckCircle2, Clock, Check } from 'lucide-react'

interface NotificationItem {
  id: string
  title: string
  description: string
  timestamp: string
  read: boolean
  type: 'project' | 'proposal' | 'system'
  link?: string
}

export const ClientNotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    async function fetchNotifications() {
      try {
        setLoading(true)
        const data = await projectService.getMyProjects(0, 20)
        if (mounted) {
          const list: NotificationItem[] = []
          data.projects.forEach((p: Project) => {
            if (p.status === 'OPEN') {
              list.push({
                id: `notif-proj-${p.id}`,
                title: 'Project Published to Marketplace',
                description: `"${p.title}" is open for bids. Budget: ${p.currency} ${p.budget.toLocaleString()}.`,
                timestamp: 'Active',
                read: false,
                type: 'project',
                link: `/client/projects/${p.id}/proposals`,
              })
            } else if (p.status === 'IN_PROGRESS') {
              list.push({
                id: `notif-prog-${p.id}`,
                title: 'Contract in Execution',
                description: `Proposal accepted for "${p.title}". Escrow funds secured.`,
                timestamp: 'Milestone active',
                read: true,
                type: 'proposal',
                link: `/client/projects/${p.id}/proposals`,
              })
            }
          })

          list.push({
            id: 'notif-keycloak',
            title: 'Keycloak SSO Identity Established',
            description: 'Authenticated with Client credentials and procurement authority.',
            timestamp: 'Session start',
            read: true,
            type: 'system',
          })

          setNotifications(list)
        }
      } catch {
        // fallback
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    void fetchNotifications()
    return () => {
      mounted = false
    }
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity Center</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 tracking-tight">
            Client Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status updates on incoming proposals, contract milestones, and platform security.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 bg-white border border-slate-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : notifications.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100 shadow-xs">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !item.read ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                    item.type === 'proposal'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-blue-100 text-[#2563EB]'
                  }`}
                >
                  {item.type === 'proposal' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xs font-bold text-slate-900">{item.title}</h3>
                    {!item.read && <Badge variant="info">NEW</Badge>}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-2">
                    {item.description}
                  </p>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{item.timestamp}</span>
                  </span>
                </div>
              </div>

              {item.link && (
                <a
                  href={item.link}
                  className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap shrink-0"
                >
                  View Details
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You are caught up. Notifications for proposal submissions and project milestones will appear here."
        />
      )}
    </div>
  )
}
