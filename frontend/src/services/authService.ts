import { keycloak } from '../auth'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  idToken?: string
  expiresAt: number
}

export interface UserClaims {
  sub: string
  preferred_username: string
  email?: string
  name?: string
  given_name?: string
  family_name?: string
}

export interface InitiateRegisterResult {
  email: string
  maskedEmail: string
  username: string
  expiresIn?: number
  cooldown?: number
  message?: string
}

export interface RegisterInput {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  role?: string
}

export interface CompleteRegistrationInput extends RegisterInput {
  otp: string
}

const STORAGE_KEY = 'fh_auth_session'

// In-memory pending registration cache (kept in client memory during the registration turn only)
let pendingRegistration: RegisterInput | null = null

export const getKeycloakBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as unknown as { __KEYCLOAK_URL__?: string }).__KEYCLOAK_URL__) {
    return (window as unknown as { __KEYCLOAK_URL__: string }).__KEYCLOAK_URL__
  }
  return (
    import.meta.env.VITE_KEYCLOAK_URL ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
      ? `${window.location.protocol}//${window.location.hostname}:8180`
      : 'http://localhost:8180')
  )
}

export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as unknown as { __API_URL__?: string }).__API_URL__) {
    return (window as unknown as { __API_URL__: string }).__API_URL__
  }
  return import.meta.env.VITE_API_URL || ''
}

export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email
  const [localPart, domain] = email.split('@')
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`
  }
  return `${localPart.slice(0, 2)}***${localPart.slice(-1)}@${domain}`
}

function syncToKeycloakInstance(tokens: AuthTokens, claims: UserClaims) {
  keycloak.token = tokens.accessToken
  keycloak.refreshToken = tokens.refreshToken
  keycloak.idToken = tokens.idToken
  keycloak.authenticated = true
  keycloak.tokenParsed = claims as unknown as typeof keycloak.tokenParsed
  keycloak.subject = claims.sub
}

function clearKeycloakInstance() {
  keycloak.token = undefined
  keycloak.refreshToken = undefined
  keycloak.idToken = undefined
  keycloak.authenticated = false
  keycloak.tokenParsed = undefined
  keycloak.subject = undefined
}

export const authService = {
  getStoredSession(): { tokens: AuthTokens; claims: UserClaims } | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return null
      const session = JSON.parse(raw) as { tokens: AuthTokens; claims: UserClaims }
      if (Date.now() < session.tokens.expiresAt) {
        syncToKeycloakInstance(session.tokens, session.claims)
        return session
      }
      return null
    } catch {
      return null
    }
  },

  /**
   * Direct Login: accepts Username or Email and Password.
   * Authenticates directly with Keycloak using standard OAuth2 Resource Owner Password Credentials Grant.
   */
  async login(usernameOrEmail: string, password: string): Promise<{ tokens: AuthTokens; claims: UserClaims }> {
    const baseUrl = getKeycloakBaseUrl()
    const tokenUrl = `${baseUrl}/realms/freelancehub/protocol/openid-connect/token`

    const body = new URLSearchParams({
      client_id: 'freelancehub-web',
      grant_type: 'password',
      username: usernameOrEmail.trim(),
      password,
      scope: 'openid profile email',
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      if (errData.error === 'invalid_grant') {
        throw new Error('Invalid username or password. Please verify your credentials.')
      }
      throw new Error(errData.error_description || errData.error || 'Authentication failed. Please try again.')
    }

    const data = await response.json()
    const claims = parseJwt(data.access_token) as unknown as UserClaims

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresAt: Date.now() + (Number(data.expires_in) || 300) * 1000,
    }

    const session = { tokens, claims }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    syncToKeycloakInstance(tokens, claims)

    return session
  },

  /**
   * Forgot Password: sends password reset email via Keycloak SMTP through API Gateway
   */
  async sendPasswordResetEmail(usernameOrEmail: string): Promise<{ email: string; maskedEmail: string }> {
    const apiBase = getApiBaseUrl()
    const url = `${apiBase}/api/v1/auth/forgot-password`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier: usernameOrEmail.trim() }),
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => null)
      const errorMsg =
        errJson?.detail ||
        errJson?.message ||
        'Failed to dispatch password reset email. Please try again.'
      throw new Error(errorMsg)
    }

    const data = await response.json()
    return {
      email: usernameOrEmail.trim(),
      maskedEmail: data.maskedEmail || maskEmail(usernameOrEmail.trim()),
    }
  },

  /**
   * New User Registration: Step 1 - Request 6-digit OTP from Keycloak Registration OTP SPI via backend
   */
  async initiateRegistrationWithOtp(input: RegisterInput): Promise<InitiateRegisterResult> {
    pendingRegistration = { ...input }

    const apiBase = getApiBaseUrl()
    const url = `${apiBase}/api/v1/auth/registration-otp/send`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: input.email.trim(),
        username: input.username.trim(),
      }),
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => null)
      const errorMsg =
        errJson?.detail ||
        errJson?.message ||
        (response.status === 409
          ? 'An account with this username or email already exists.'
          : 'Failed to dispatch verification code. Please try again.')
      throw new Error(errorMsg)
    }

    const data = await response.json()
    return {
      email: input.email.trim(),
      maskedEmail: data.maskedEmail || maskEmail(input.email.trim()),
      username: input.username.trim(),
      expiresIn: data.expiresIn || 300,
      cooldown: data.cooldown || 60,
      message: data.message,
    }
  },

  /**
   * Resend Registration OTP
   */
  async resendRegistrationOtp(emailOrUsername?: string): Promise<InitiateRegisterResult> {
    const email = pendingRegistration?.email || (emailOrUsername?.includes('@') ? emailOrUsername : '')
    const username = pendingRegistration?.username || (!emailOrUsername?.includes('@') ? emailOrUsername : '')

    if (!email) {
      throw new Error('Email address required for resending verification code.')
    }

    const apiBase = getApiBaseUrl()
    const url = `${apiBase}/api/v1/auth/registration-otp/send`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        username: username?.trim() || undefined,
      }),
    })

    if (!response.ok) {
      const errJson = await response.json().catch(() => null)
      const errorMsg =
        errJson?.detail ||
        errJson?.message ||
        'Failed to resend verification code. Please try again.'
      throw new Error(errorMsg)
    }

    const data = await response.json()
    return {
      email: email.trim(),
      maskedEmail: data.maskedEmail || maskEmail(email.trim()),
      username: username || '',
      expiresIn: data.expiresIn || 300,
      cooldown: data.cooldown || 60,
      message: data.message,
    }
  },

  /**
   * Verify Registration OTP and Complete Registration:
   * 1. Verifies 6-digit OTP via Keycloak SPI and gets single-use verificationTicket.
   * 2. Calls backend /api/v1/auth/register to create verified user in Keycloak, assign role, and sync profile.
   * 3. Logs in to obtain OAuth2 JWT tokens.
   */
  async verifyRegistrationOtp(
    paramOrUser: CompleteRegistrationInput | string,
    maybePassword?: string,
    maybeOtp?: string,
  ): Promise<{ tokens: AuthTokens; claims: UserClaims }> {
    let registrationData: CompleteRegistrationInput

    if (typeof paramOrUser === 'object') {
      registrationData = paramOrUser
    } else {
      if (!pendingRegistration) {
        throw new Error('Registration session expired. Please re-enter your registration details.')
      }
      registrationData = {
        ...pendingRegistration,
        username: paramOrUser || pendingRegistration.username,
        password: maybePassword || pendingRegistration.password,
        otp: maybeOtp || '',
      }
    }

    if (!registrationData.otp || registrationData.otp.trim().length !== 6) {
      throw new Error('Please enter the full 6-digit verification code.')
    }

    const apiBase = getApiBaseUrl()

    // Step 1: Verify OTP and acquire single-use verification ticket
    const verifyUrl = `${apiBase}/api/v1/auth/registration-otp/verify`
    const verifyResp = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: registrationData.email.trim(),
        otp: registrationData.otp.trim(),
      }),
    })

    if (!verifyResp.ok) {
      const errJson = await verifyResp.json().catch(() => null)
      const errorMsg =
        errJson?.detail ||
        errJson?.message ||
        'Invalid or expired verification code. Please check your Gmail and try again.'
      throw new Error(errorMsg)
    }

    const verifyData = await verifyResp.json()
    const ticket = verifyData.verificationTicket

    if (!ticket) {
      throw new Error('Failed to obtain verification ticket from identity service.')
    }

    // Step 2: Complete User Registration with verified ticket
    const registerUrl = `${apiBase}/api/v1/auth/register`
    const registerResp = await fetch(registerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: registrationData.firstName.trim(),
        lastName: registrationData.lastName.trim(),
        username: registrationData.username.trim(),
        email: registrationData.email.trim(),
        password: registrationData.password,
        role: registrationData.role || 'ROLE_FREELANCER',
        verificationTicket: ticket,
      }),
    })

    if (!registerResp.ok) {
      const errJson = await registerResp.json().catch(() => null)
      const errorMsg =
        errJson?.detail ||
        errJson?.message ||
        'Registration could not be completed. Please try again.'
      throw new Error(errorMsg)
    }

    // Clear pending registration state from memory
    pendingRegistration = null

    // Step 3: Perform direct OAuth2 login with the newly created account
    return this.login(registrationData.username, registrationData.password)
  },

  /**
   * Direct registration fallback
   */
  async register(input: RegisterInput): Promise<{ tokens: AuthTokens; claims: UserClaims }> {
    return this.initiateRegistrationWithOtp(input).then(() => {
      return {
        tokens: {
          accessToken: '',
          refreshToken: '',
          expiresAt: 0,
        },
        claims: {
          sub: '',
          preferred_username: input.username,
          email: input.email,
        },
      }
    })
  },

  async logout(): Promise<void> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const session = JSON.parse(raw) as { tokens: AuthTokens }
        if (session?.tokens?.refreshToken) {
          const baseUrl = getKeycloakBaseUrl()
          const logoutUrl = `${baseUrl}/realms/freelancehub/protocol/openid-connect/logout`
          const body = new URLSearchParams({
            client_id: 'freelancehub-web',
            refresh_token: session.tokens.refreshToken,
          })
          await fetch(logoutUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
          }).catch(() => {})
        }
      }
    } finally {
      localStorage.removeItem(STORAGE_KEY)
      clearKeycloakInstance()
    }
  },

  async updateToken(minValidity = 30): Promise<boolean> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    const session = JSON.parse(raw) as { tokens: AuthTokens; claims: UserClaims }
    const timeRemaining = (session.tokens.expiresAt - Date.now()) / 1000

    if (timeRemaining > minValidity) {
      return false
    }

    const baseUrl = getKeycloakBaseUrl()
    const tokenUrl = `${baseUrl}/realms/freelancehub/protocol/openid-connect/token`
    const body = new URLSearchParams({
      client_id: 'freelancehub-web',
      grant_type: 'refresh_token',
      refresh_token: session.tokens.refreshToken,
    })

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!response.ok) {
      await this.logout()
      return false
    }

    const data = await response.json()
    const claims = parseJwt(data.access_token) as unknown as UserClaims

    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || session.tokens.refreshToken,
      idToken: data.id_token || session.tokens.idToken,
      expiresAt: Date.now() + (Number(data.expires_in) || 300) * 1000,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tokens, claims }))
    syncToKeycloakInstance(tokens, claims)
    return true
  },
}
