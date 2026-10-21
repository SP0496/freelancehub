import {
    afterEach,
    beforeEach,
    describe,
    expect,
    it,
    vi,
} from 'vitest'

import { getJson, postJson } from './api'

const { mockKeycloak } = vi.hoisted(() => ({
    mockKeycloak: {
        authenticated: true,
        token: 'test-access-token',
        updateToken: vi.fn(),
    },
}))

vi.mock('./auth', () => ({
    keycloak: mockKeycloak,
}))

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
    vi.resetAllMocks()

    mockKeycloak.authenticated = true
    mockKeycloak.token = 'test-access-token'
    mockKeycloak.updateToken.mockResolvedValue(false)

    vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe('API helper', () => {
    it('blocks requests when the user is signed out', async () => {
        mockKeycloak.authenticated = false

        await expect(
            getJson('/api/v1/projects'),
        ).rejects.toMatchObject({
            status: 401,
            message: 'Please sign in to continue.',
        })

        expect(fetchMock).not.toHaveBeenCalled()
        expect(mockKeycloak.updateToken).not.toHaveBeenCalled()
    })

    it('blocks requests when refreshing the token fails', async () => {
        mockKeycloak.updateToken.mockRejectedValue(
            new Error('Session expired'),
        )

        await expect(
            getJson('/api/v1/projects'),
        ).rejects.toMatchObject({
            status: 401,
            message:
                'Your session has expired. Please sign out and sign in again.',
        })

        expect(fetchMock).not.toHaveBeenCalled()
    })

    it('sends the refreshed access token with the request', async () => {
        mockKeycloak.updateToken.mockImplementation(async () => {
            mockKeycloak.token = 'refreshed-test-token'
            return true
        })

        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ projects: [] }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
        )

        const result = await getJson('/api/v1/projects')

        expect(mockKeycloak.updateToken).toHaveBeenCalledWith(30)

        expect(fetchMock).toHaveBeenCalledWith(
            '/api/v1/projects',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    Authorization: 'Bearer refreshed-test-token',
                }),
            }),
        )

        expect(result).toEqual({ projects: [] })
    })

    it('preserves backend validation errors', async () => {
        fetchMock.mockResolvedValue(
            new Response(
                JSON.stringify({
                    detail: 'Correct the invalid fields and try again.',
                    errors: [
                        {
                            field: 'title',
                            message: 'must not be blank',
                        },
                    ],
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/problem+json',
                    },
                },
            ),
        )

        await expect(
            postJson('/api/v1/projects', {
                title: '',
                description: 'Build a website',
                budget: 5000,
            }),
        ).rejects.toMatchObject({
            status: 400,
            message: 'Correct the invalid fields and try again.',
            errors: [
                {
                    field: 'title',
                    message: 'must not be blank',
                },
            ],
        })
    })
})