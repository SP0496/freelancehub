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

const STORAGE_KEY = 'fh_auth_session'

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
      // Check if session has not completely expired (within refresh window)
      if (Date.now() < session.tokens.expiresAt) {
        syncToKeycloakInstance(session.tokens, session.claims)
        return session
      }
      return null
    } catch {
      return null
    }
  },

  async login(username: string, password: string): Promise<{ tokens: AuthTokens; claims: UserClaims }> {
    const baseUrl = getKeycloakBaseUrl()
    const tokenUrl = `${baseUrl}/realms/freelancehub/protocol/openid-connect/token`

    const body = new URLSearchParams({
      client_id: 'freelancehub-web',
      grant_type: 'password',
      username: username.trim(),
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
        throw new Error('Invalid username or password. Please check your credentials.')
      }
      throw new Error(errData.error_description || 'Authentication failed. Please try again.')
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

  async register(input: {
    username: string
    email: string
    firstName: string
    lastName: string
    password: string
  }): Promise<{ tokens: AuthTokens; claims: UserClaims }> {
    const baseUrl = getKeycloakBaseUrl()

    // 1. Obtain admin token to provision user in freelancehub realm
    const adminTokenUrl = `${baseUrl}/realms/master/protocol/openid-connect/token`
    const adminBody = new URLSearchParams({
      client_id: 'admin-cli',
      grant_type: 'password',
      username: 'admin',
      password: import.meta.env.VITE_KEYCLOAK_ADMIN_PASSWORD || 'LocalAdminPassword123',
    })

    const adminTokenResp = await fetch(adminTokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: adminBody.toString(),
    })

    if (!adminTokenResp.ok) {
      throw new Error('Could not reach identity authority to provision user.')
    }

    const adminTokenData = await adminTokenResp.json()
    const adminToken = adminTokenData.access_token

    // 2. Create the user
    const createUserUrl = `${baseUrl}/admin/realms/freelancehub/users`
    const userPayload = {
      username: input.username.trim(),
      email: input.email.trim(),
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: input.password,
          temporary: false,
        },
      ],
    }

    const createResp = await fetch(createUserUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userPayload),
    })

    if (createResp.status === 409) {
      throw new Error('An account with this username or email already exists.')
    }

    if (!createResp.ok && createResp.status !== 201) {
      const errJson = await createResp.json().catch(() => null)
      const errText =
        errJson?.errorMessage ||
        errJson?.error_description ||
        (await createResp.text().catch(() => ''))
      throw new Error(errText || 'Failed to create account. Please check your details.')
    }

    // 3. Immediately log in the newly registered user
    return this.login(input.username, input.password)
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
