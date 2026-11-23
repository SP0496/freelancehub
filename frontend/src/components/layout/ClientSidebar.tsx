import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  FileCheck,
  CreditCard,
  MessageSquare,
  Bell,
  Star,
  Building2,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react'
import { usePortal } from '../../context/PortalContext'

export interface ClientSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/client/projects/new', label: 'Post a Project', icon: PlusCircle },
  { to: '/client/projects', label: 'My Projects', icon: Briefcase },
  { to: '/client/freelancers', label: 'Browse Freelancers', icon: Users },
  { to: '/client/contracts', label: 'Active Contracts', icon: FileCheck },
  { to: '/client/payments', label: 'Payments & Escrow', icon: CreditCard },
  { to: '/client/messages', label: 'Messages', icon: MessageSquare },
  { to: '/client/notifications', label: 'Notifications', icon: Bell },
  { to: '/client/reviews', label: 'Reviews & Feedback', icon: Star },
  { to: '/client/profile', label: 'Company Profile', icon: Building2 },
  { to: '/client/help', label: 'Help & Support', icon: HelpCircle },
]

export const ClientSidebar: React.FC<ClientSidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = usePortal()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Client Navigation</span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:bg-slate-100"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#2563EB] font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </div>

        <div className="p-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
