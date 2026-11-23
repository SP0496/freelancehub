import { apiGet, apiPut } from './apiClient'

export type UserProfile = {
  displayName: string
  headline: string | null
}

export type UpdateProfileInput = {
  displayName: string
  headline: string | null
}

export const userService = {
  async getMyProfile(signal?: AbortSignal): Promise<UserProfile> {
    return apiGet<UserProfile>('/api/v1/users/me', { signal })
  },

  async updateMyProfile(input: UpdateProfileInput): Promise<UserProfile> {
    return apiPut<UserProfile>('/api/v1/users/me', input)
  },
}
