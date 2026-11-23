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
  loginWithCredentials: (username: string, password: string) => Promise<void>
  registerWithCredentials: (input: {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
  }) => Promise<void>
  login: () => Promise<void>
  register: () => Promise<void>
  logout: () => Promise<void>
}

export const PortalContext = createContext<PortalContextValue | undefined>(undefined)
