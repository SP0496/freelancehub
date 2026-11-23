import React from 'react'
import { Link } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../common/Button'
import { LogIn, User, Menu } from 'lucide-react'

export interface NavbarProps {
  onToggleSidebar?: () => void
  isPortal?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isPortal = false }) => {
  const { portal, isAuthenticated, username, avatarUrl } = usePortal()

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isPortal && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded bg-[#172B4D] text-white flex items-center justify-center font-bold text-base font-heading">
              FH
            </span>
            <span className="font-heading font-bold text-lg text-slate-900 tracking-tight">
              Freelance<span className="text-[#2563EB]">Hub</span>
            </span>
          </Link>

          {isPortal && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 ml-2">
              {portal === 'freelancer' ? 'Freelancer Portal' : 'Client Portal'}
            </span>
          )}
        </div>

        {/* Center / Navigation Links for Public View */}
        {!isPortal && (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/freelancer/projects" className="hover:text-[#2563EB] transition-colors">
              Find Projects
            </Link>
            <Link to="/select-role" className="hover:text-[#2563EB] transition-colors">
              Hire Talent
            </Link>
            <a href="/#how-it-works" className="hover:text-[#2563EB] transition-colors">
              How It Works
            </a>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={portal === 'freelancer' ? '/freelancer/profile' : '/client/profile'}
              className="flex items-center gap-2.5 py-1 px-2.5 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group"
              title="Go to Profile Settings"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 ring-2 ring-transparent group-hover:ring-[#2563EB]/20 transition-all shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 group-hover:bg-blue-50 group-hover:text-[#2563EB] group-hover:border-blue-200 transition-colors shrink-0">
                  <User className="w-4 h-4 text-slate-500 group-hover:text-[#2563EB]" />
                </div>
              )}
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-semibold text-slate-800 max-w-[120px] truncate leading-tight">
                  {username}
                </span>
                <span className="block text-[10px] text-slate-400 group-hover:text-[#2563EB] transition-colors leading-tight">
                  Profile Settings
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link to="/login">
                <Button variant="ghost" size="sm" leftIcon={<LogIn className="w-4 h-4" />}>
                  Sign in
                </Button>
              </Link>
              <Link to="/select-role">
                <Button variant="secondary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
