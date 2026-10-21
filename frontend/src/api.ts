import { keycloak } from './auth'

export type FieldError = {
    field: string
    message: string
}

export class ApiError extends Error {
    readonly status: number
    readonly errors: FieldError[]

    constructor(
        status: number,
        message: string,
        errors: FieldError[] = [],
    ) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.errors = errors
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function readFieldErrors(value: unknown): FieldError[] {
    if (!Array.isArray(value)) {
        return []
    }

    const errors: FieldError[] = []

    for (const item of value) {
        if (
            isRecord(item) &&
            typeof item.field === 'string' &&
            typeof item.message === 'string'
        ) {
            errors.push({
                field: item.field,
                message: item.message,
            })
        }
    }

    return errors
}

async function requestJson<T>(
    path: string,
    method: 'GET' | 'POST' | 'PUT',
    body: unknown,
    signal?: AbortSignal,
): Promise<T> {
    if (!path.startsWith('/api/')) {
        throw new Error('API paths must start with /api/')
    }

    if (!keycloak.authenticated) {
        throw new ApiError(401, 'Please sign in to continue.')
    }

    try {
        await keycloak.updateToken(30)
    } catch {
        throw new ApiError(
            401,
            'Your session has expired. Please sign out and sign in again.',
        )
    }

    if (!keycloak.token) {
        throw new ApiError(401, 'Please sign in again.')
    }

    const headers: Record<string, string> = {
        Accept: 'application/json',
        Authorization: `Bearer ${keycloak.token}`,
    }

    let requestBody: string | undefined

    if (body !== undefined) {
        headers['Content-Type'] = 'application/json'
        requestBody = JSON.stringify(body)
    }

    const response = await fetch(path, {
        method,
        headers,
        body: requestBody,
        cache: 'no-store',
        signal,
    })

    if (!response.ok) {
        let message = `Request failed (${response.status}).`
        let errors: FieldError[] = []

        try {
            const problem: unknown = await response.json()

            if (isRecord(problem)) {
                if (
                    typeof problem.detail === 'string' &&
                    problem.detail.trim()
                ) {
                    message = problem.detail
                }

                errors = readFieldErrors(problem.errors)
            }
        } catch {
            // Some error responses have no JSON body.
        }

        if (response.status === 401) {
            message = 'Your session is not valid. Please sign in again.'
        }

        throw new ApiError(response.status, message, errors)
    }

    return response.json() as Promise<T>
}

export function getJson<T>(
    path: string,
    signal?: AbortSignal,
): Promise<T> {
    return requestJson<T>(path, 'GET', undefined, signal)
}

export function postJson<T>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
): Promise<T> {
    return requestJson<T>(path, 'POST', body, signal)
}

export function putJson<T>(
    path: string,
    body: unknown,
    signal?: AbortSignal,
): Promise<T> {
    return requestJson<T>(path, 'PUT', body, signal)
}