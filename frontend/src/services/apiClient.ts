import axios, { type AxiosRequestConfig } from 'axios'
import { keycloak } from '../auth'

export type FieldError = {
  field: string
  message: string
}

export class ApiError extends Error {
  readonly status: number
  readonly errors: FieldError[]

  constructor(status: number, message: string, errors: FieldError[] = []) {
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
  if (!Array.isArray(value)) return []
  const errors: FieldError[] = []
  for (const item of value) {
    if (isRecord(item) && typeof item.field === 'string' && typeof item.message === 'string') {
      errors.push({ field: item.field, message: item.message })
    }
  }
  return errors
}

export const axiosInstance = axios.create({
  baseURL: '',
  headers: {
    Accept: 'application/json',
  },
})

// Request interceptor: attach bearer token and refresh if nearing expiry
axiosInstance.interceptors.request.use(async (config) => {
  if (!keycloak.authenticated) {
    throw new ApiError(401, 'Please sign in to continue.')
  }

  try {
    await keycloak.updateToken(30)
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign out and sign in again.')
  }

  if (!keycloak.token) {
    throw new ApiError(401, 'Please sign in again.')
  }

  config.headers.Authorization = `Bearer ${keycloak.token}`
  return config
})

// Response interceptor: unwrap standard errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error instanceof ApiError) {
      return Promise.reject(error)
    }

    const status = error.response?.status ?? 500
    let message = error.message || `Request failed (${status})`
    let errors: FieldError[] = []

    const data = error.response?.data
    if (isRecord(data)) {
      if (typeof data.detail === 'string' && data.detail.trim()) {
        message = data.detail
      } else if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message
      }
      errors = readFieldErrors(data.errors)
    }

    if (status === 401) {
      message = 'Your session is not valid. Please sign in again.'
    }

    return Promise.reject(new ApiError(status, message, errors))
  }
)

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.get<T>(url, config)
  return res.data
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.post<T>(url, data, config)
  return res.data
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  const res = await axiosInstance.put<T>(url, data, config)
  return res.data
}
