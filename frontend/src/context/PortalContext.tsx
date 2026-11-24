/* oxlint-disable react/only-export-components */
import React, { useState, useEffect } from 'react'
import { authService, type RegisterInput } from '../services/authService'
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

  const [avatarUrl, setAvatarUrlState] = useState<string | null>(() => {
    const activeUser = stored?.claims.preferred_username || keycloak.tokenParsed?.preferred_username
    return activeUser ? localStorage.getItem(`fh_user_avatar_${activeUser}`) : null
  })

  function setAvatarUrl(url: string | null) {
    if (username && username !== 'User') {
      const key = `fh_user_avatar_${username}`
      if (url) {
        try {
          localStorage.setItem(key, url)
        } catch {
          // Fallback if quota exceeded
        }
        setAvatarUrlState(url)
      } else {
        localStorage.removeItem(key)
        setAvatarUrlState(null)
      }
    } else {
      setAvatarUrlState(url)
    }
  }

  function setPortal(newPortal: PortalType) {
    setPortalState(newPortal)
    localStorage.setItem('fh_active_portal', newPortal)
  }

  // Sync portal preference and avatar if changed in other tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'fh_active_portal' && (e.newValue === 'client' || e.newValue === 'freelancer')) {
        setPortalState(e.newValue)
      }
      if (username && e.key === `fh_user_avatar_${username}`) {
        setAvatarUrlState(e.newValue)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [username])

  async function loginWithCredentials(userOrEmail: string, pass: string) {
    const session = await authService.login(userOrEmail, pass)
    setIsAuthenticated(true)
    const activeName = session.claims.preferred_username || userOrEmail
    setUsername(activeName)
    setEmail(session.claims.email || '')
    setSub(session.claims.sub || '')
    setAvatarUrlState(localStorage.getItem(`fh_user_avatar_${activeName}`))
  }

  async function sendPasswordResetEmail(userOrEmail: string) {
    return authService.sendPasswordResetEmail(userOrEmail)
  }

  async function initiateRegistrationWithOtp(input: RegisterInput) {
    return authService.initiateRegistrationWithOtp(input)
  }

  async function verifyRegistrationOtp(user: string, pass: string, otp: string) {
    const session = await authService.verifyRegistrationOtp(user, pass, otp)
    setIsAuthenticated(true)
    const activeName = session.claims.preferred_username || user
    setUsername(activeName)
    setEmail(session.claims.email || '')
    setSub(session.claims.sub || '')
    setAvatarUrlState(localStorage.getItem(`fh_user_avatar_${activeName}`))
  }

  async function resendRegistrationOtp(user: string) {
    return authService.resendRegistrationOtp(user)
  }

  async function registerWithCredentials(input: RegisterInput) {
    const session = await authService.register(input)
    if (session.tokens.accessToken) {
      setIsAuthenticated(true)
      const activeName = session.claims.preferred_username || input.username
      setUsername(activeName)
      setEmail(session.claims.email || input.email)
      setSub(session.claims.sub || '')
      setAvatarUrlState(localStorage.getItem(`fh_user_avatar_${activeName}`))
    }
  }

  async function logout() {
    await authService.logout()
    setIsAuthenticated(false)
    setUsername('User')
    setEmail('')
    setSub('')
    setAvatarUrlState(null)
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
        avatarUrl,
        setAvatarUrl,
        loginWithCredentials,
        sendPasswordResetEmail,
        initiateRegistrationWithOtp,
        verifyRegistrationOtp,
        resendRegistrationOtp,
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
