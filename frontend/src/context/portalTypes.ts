import { createContext } from 'react'

export type PortalType = 'freelancer' | 'client'

export interface PortalContextValue {
  portal: PortalType
  setPortal: (portal: PortalType) => void
  isAuthenticated: boolean
  isInitialized: boolean
  username: string
  email: string
  sub: string
  login: (redirectUri?: string) => Promise<void>
  register: (redirectUri?: string) => Promise<void>
  logout: (redirectUri?: string) => Promise<void>
}

export const PortalContext = createContext<PortalContextValue | undefined>(undefined)
