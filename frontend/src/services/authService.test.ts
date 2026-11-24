import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authService, maskEmail } from './authService'

describe('maskEmail helper', () => {
  it('masks normal email addresses appropriately', () => {
    expect(maskEmail('satishanadasu8@gmail.com')).toBe('sa***8@gmail.com')
    expect(maskEmail('user@domain.com')).toBe('us***r@domain.com')
    expect(maskEmail('ab@domain.com')).toBe('a***@domain.com')
  })

  it('handles non-email strings gracefully', () => {
    expect(maskEmail('')).toBe('')
    expect(maskEmail('notanemail')).toBe('notanemail')
  })
})

describe('authService Login & Password Reset', () => {
  const fetchMock = vi.fn<typeof fetch>()
  const mockStorage: Record<string, string> = {}

  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    for (const key in mockStorage) delete mockStorage[key]
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
      clear: () => {
        for (const key in mockStorage) delete mockStorage[key]
      },
    })
  })

  it('logs in existing user directly with username/email and password', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/protocol/openid-connect/token')) {
        return new Response(
          JSON.stringify({
            access_token:
              'header.' + btoa(JSON.stringify({ sub: 'user-subbu', preferred_username: 'subbu' })) + '.sig',
            refresh_token: 'refresh_tok',
            expires_in: 300,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(null, { status: 200 })
    })

    const session = await authService.login('subbu', 'Satish123!')
    expect(session.tokens.accessToken).toBeDefined()
    expect(session.claims.preferred_username).toBe('subbu')
    expect(mockStorage['fh_auth_session']).toBeDefined()
  })

  it('sends password reset email via API Gateway to Keycloak SMTP', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/api/v1/auth/forgot-password')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'A password reset link has been dispatched to your Gmail via Keycloak SMTP.',
            maskedEmail: 'su***u@example.com',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(null, { status: 404 })
    })

    const result = await authService.sendPasswordResetEmail('subbu')
    expect(result.email).toBe('subbu')
    expect(result.maskedEmail).toBe('su***u@example.com')
  })
})

describe('authService Registration with Gmail OTP', () => {
  const fetchMock = vi.fn<typeof fetch>()
  const mockStorage: Record<string, string> = {}

  beforeEach(() => {
    vi.resetAllMocks()
    vi.stubGlobal('fetch', fetchMock)
    for (const key in mockStorage) delete mockStorage[key]
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value
      },
      removeItem: (key: string) => {
        delete mockStorage[key]
      },
      clear: () => {
        for (const key in mockStorage) delete mockStorage[key]
      },
    })
  })

  it('initiates registration by requesting OTP from backend gateway', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/api/v1/auth/registration-otp/send')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'A 6-digit verification code has been dispatched via Keycloak SMTP.',
            maskedEmail: 'ne***r@gmail.com',
            expiresIn: 300,
            cooldown: 60,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(null, { status: 404 })
    })

    const result = await authService.initiateRegistrationWithOtp({
      firstName: 'New',
      lastName: 'User',
      username: 'newuser',
      email: 'newuser@gmail.com',
      password: 'Password123!',
      role: 'ROLE_FREELANCER',
    })

    expect(result.email).toBe('newuser@gmail.com')
    expect(result.maskedEmail).toBe('ne***r@gmail.com')
    expect(result.username).toBe('newuser')
    expect(result.expiresIn).toBe(300)
    expect(result.cooldown).toBe(60)
  })

  it('completes registration when OTP is verified and account is provisioned', async () => {
    fetchMock.mockImplementation(async (input) => {
      const url = String(input)
      if (url.includes('/api/v1/auth/registration-otp/send')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'OTP dispatched',
            maskedEmail: 'ne***r@gmail.com',
            expiresIn: 300,
            cooldown: 60,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.includes('/api/v1/auth/registration-otp/verify')) {
        return new Response(
          JSON.stringify({
            success: true,
            verificationTicket: 'mock_ticket_123',
            email: 'newuser@gmail.com',
            expiresIn: 600,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.includes('/api/v1/auth/register')) {
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Registration completed successfully.',
            userId: 'new-user-123',
            username: 'newuser',
            email: 'newuser@gmail.com',
            role: 'ROLE_FREELANCER',
          }),
          { status: 201, headers: { 'Content-Type': 'application/json' } },
        )
      }
      if (url.includes('/protocol/openid-connect/token')) {
        return new Response(
          JSON.stringify({
            access_token:
              'header.' + btoa(JSON.stringify({ sub: 'new-user-123', preferred_username: 'newuser' })) + '.sig',
            refresh_token: 'refresh_tok_xyz',
            expires_in: 300,
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        )
      }
      return new Response(null, { status: 404 })
    })

    // Initiate first
    await authService.initiateRegistrationWithOtp({
      firstName: 'New',
      lastName: 'User',
      username: 'newuser',
      email: 'newuser@gmail.com',
      password: 'Password123!',
      role: 'ROLE_FREELANCER',
    })

    const result = await authService.verifyRegistrationOtp('newuser', 'Password123!', '123456')
    expect(result.tokens.accessToken).toBeDefined()
    expect(result.claims.preferred_username).toBe('newuser')
  })
})
