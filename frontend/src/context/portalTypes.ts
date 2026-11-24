import { createContext } from 'react'
import type { RegisterInput, InitiateRegisterResult } from '../services/authService'

export type PortalType = 'freelancer' | 'client'

export interface PortalContextValue {
  portal: PortalType
  setPortal: (portal: PortalType) => void
  isAuthenticated: boolean
  isInitialized: boolean
  username: string
  email: string
  sub: string
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void

  // Login & Password Reset
  loginWithCredentials: (username: string, password: string) => Promise<void>
  sendPasswordResetEmail: (usernameOrEmail: string) => Promise<{ email: string; maskedEmail: string }>

  // Registration with Gmail OTP
  initiateRegistrationWithOtp: (input: RegisterInput) => Promise<InitiateRegisterResult>
  verifyRegistrationOtp: (username: string, password: string, otp: string) => Promise<void>
  resendRegistrationOtp: (username: string) => Promise<InitiateRegisterResult>
  registerWithCredentials: (input: RegisterInput) => Promise<void>

  login: () => Promise<void>
  register: () => Promise<void>
  logout: () => Promise<void>
}

export const PortalContext = createContext<PortalContextValue | undefined>(undefined)
