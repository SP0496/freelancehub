/* oxlint-disable react/only-export-components */
import React, { useState, useEffect } from 'react'
import { keycloak } from '../auth'
import { PortalContext, type PortalType } from './portalTypes'

export type { PortalType } from './portalTypes'
export { usePortal } from './usePortal'

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portal, setPortalState] = useState<PortalType>(() => {
    const saved = localStorage.getItem('fh_active_portal')
    return (saved === 'client' || saved === 'freelancer') ? saved : 'freelancer'
  })

  const isAuthenticated = Boolean(keycloak.authenticated)
  const username = String(keycloak.tokenParsed?.preferred_username ?? 'User')
  const email = String(keycloak.tokenParsed?.email ?? '')
  const sub = String(keycloak.tokenParsed?.sub ?? '')

  function setPortal(newPortal: PortalType) {
    setPortalState(newPortal)
    localStorage.setItem('fh_active_portal', newPortal)
  }

  // Sync portal preference if changed in other tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'fh_active_portal' && (e.newValue === 'client' || e.newValue === 'freelancer')) {
        setPortalState(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  async function login(redirectUri?: string) {
    const target = redirectUri || window.location.origin + '/'
    await keycloak.login({ redirectUri: target })
  }

  async function register(redirectUri?: string) {
    const target = redirectUri || window.location.origin + '/'
    await keycloak.register({ redirectUri: target })
  }

  async function logout(redirectUri?: string) {
    const target = redirectUri || window.location.origin + '/'
    await keycloak.logout({ redirectUri: target })
  }

  return (
    <PortalContext.Provider
      value={{
        portal,
        setPortal,
        isAuthenticated,
        isInitialized: true,
        username,
        email,
        sub,
        login,
        register,
        logout,
      }}
    >
      {children}
    </PortalContext.Provider>
  )
}
