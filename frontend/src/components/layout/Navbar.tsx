import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'
import { Button } from '../common/Button'
import { LogIn, LogOut, ArrowRightLeft, User, Menu } from 'lucide-react'

export interface NavbarProps {
  onToggleSidebar?: () => void
  isPortal?: boolean
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isPortal = false }) => {
  const { portal, setPortal, isAuthenticated, username, logout } = usePortal()
  const navigate = useNavigate()

  function handleSwitchPortal() {
    const nextPortal = portal === 'freelancer' ? 'client' : 'freelancer'
    setPortal(nextPortal)
    navigate(nextPortal === 'freelancer' ? '/freelancer/dashboard' : '/client/dashboard')
  }

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
            <>
              {isPortal && (
                <button
                  type="button"
                  onClick={handleSwitchPortal}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                  title={`Switch to ${portal === 'freelancer' ? 'Client' : 'Freelancer'} Portal`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                  <span>Switch to {portal === 'freelancer' ? 'Client' : 'Freelancer'}</span>
                </button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-slate-700 max-w-[120px] truncate">
                  {username}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void logout()}
                leftIcon={<LogOut className="w-3.5 h-3.5" />}
              >
                Sign out
              </Button>
            </>
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
