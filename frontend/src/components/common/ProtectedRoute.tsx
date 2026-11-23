import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { usePortal } from '../../context/PortalContext'

export interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPortal?: 'freelancer' | 'client'
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPortal,
}) => {
  const { isAuthenticated, isInitialized, portal, setPortal } = usePortal()
  const location = useLocation()

  useEffect(() => {
    if (requiredPortal && portal !== requiredPortal) {
      setPortal(requiredPortal)
    }
  }, [requiredPortal, portal, setPortal])

  if (!isInitialized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Verifying credentials...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
