/* oxlint-disable react/only-export-components */
import React, { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { keycloak } from '../auth'
import { PortalContext, type PortalType } from './portalTypes'

export type { PortalType } from './portalTypes'
export { usePortal } from './usePortal'

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portal, setPortalState] = useState<PortalType>(() => {
    const saved = localStorage.getItem('fh_active_portal')
    return (saved === 'client' || saved === 'freelancer') ? saved : 'freelancer'
  })

  const stored = authService.getStoredSession()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(stored || keycloak.authenticated))
  const [username, setUsername] = useState<string>(
    stored?.claims.preferred_username || String(keycloak.tokenParsed?.preferred_username ?? 'User')
  )
  const [email, setEmail] = useState<string>(
    stored?.claims.email || String(keycloak.tokenParsed?.email ?? '')
  )
  const [sub, setSub] = useState<string>(
    stored?.claims.sub || String(keycloak.tokenParsed?.sub ?? '')
  )

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

  async function loginWithCredentials(user: string, pass: string) {
    const session = await authService.login(user, pass)
    setIsAuthenticated(true)
    setUsername(session.claims.preferred_username || user)
    setEmail(session.claims.email || '')
    setSub(session.claims.sub || '')
  }

  async function registerWithCredentials(input: {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
  }) {
    const session = await authService.register(input)
    setIsAuthenticated(true)
    setUsername(session.claims.preferred_username || input.username)
    setEmail(session.claims.email || input.email)
    setSub(session.claims.sub || '')
  }

  async function logout() {
    await authService.logout()
    setIsAuthenticated(false)
    setUsername('User')
    setEmail('')
    setSub('')
    window.location.href = '/'
  }

  async function login() {
    window.location.href = '/login'
  }

  async function register() {
    window.location.href = '/register'
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
        loginWithCredentials,
        registerWithCredentials,
        login,
        register,
        logout,
      }}
    >
      {children}
    </PortalContext.Provider>
  )
}
