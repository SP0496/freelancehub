import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Compass,
  Send,
  FileCheck,
  Wallet,
  MessageSquare,
  Bell,
  FolderGit2,
  Star,
  Bookmark,
  UserCheck,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react'
import { usePortal } from '../../context/PortalContext'

export interface FreelancerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/freelancer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/freelancer/projects', label: 'Browse Projects', icon: Compass },
  { to: '/freelancer/proposals', label: 'My Proposals', icon: Send },
  { to: '/freelancer/contracts', label: 'Active Contracts', icon: FileCheck },
  { to: '/freelancer/earnings', label: 'My Earnings', icon: Wallet },
  { to: '/freelancer/messages', label: 'Messages', icon: MessageSquare },
  { to: '/freelancer/notifications', label: 'Notifications', icon: Bell },
  { to: '/freelancer/portfolio', label: 'My Portfolio', icon: FolderGit2 },
  { to: '/freelancer/reviews', label: 'Reviews & Ratings', icon: Star },
  { to: '/freelancer/saved', label: 'Saved Projects', icon: Bookmark },
  { to: '/freelancer/profile', label: 'Profile Settings', icon: UserCheck },
  { to: '/freelancer/help', label: 'Help & Support', icon: HelpCircle },
]

export const FreelancerSidebar: React.FC<FreelancerSidebarProps> = ({ isOpen, onClose }) => {
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
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Freelancer Navigation</span>
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
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
