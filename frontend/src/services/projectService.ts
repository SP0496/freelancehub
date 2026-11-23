import { apiGet, apiPost, apiPut } from './apiClient'

export type Project = {
  id: string
  title: string
  description: string
  budget: number
  currency: string
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type ProjectPage = {
  projects: Project[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type CreateProjectInput = {
  title: string
  description: string
  budget: number
}

export type UpdateProjectInput = {
  title: string
  description: string
  budget: number
  version: number
}

export const projectService = {
  async getOpenProjects(page = 0, size = 10, signal?: AbortSignal): Promise<ProjectPage> {
    return apiGet<ProjectPage>(`/api/v1/projects?page=${page}&size=${size}`, { signal })
  },

  async getMyProjects(page = 0, size = 10, signal?: AbortSignal): Promise<ProjectPage> {
    return apiGet<ProjectPage>(`/api/v1/projects/mine?page=${page}&size=${size}`, { signal })
  },

  async getProjectById(id: string, signal?: AbortSignal): Promise<Project> {
    return apiGet<Project>(`/api/v1/projects/${encodeURIComponent(id)}`, { signal })
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    return apiPost<Project>('/api/v1/projects', input)
  },

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    return apiPut<Project>(`/api/v1/projects/${encodeURIComponent(id)}`, input)
  },

  async cancelProject(id: string, version: number): Promise<Project> {
    return apiPost<Project>(`/api/v1/projects/${encodeURIComponent(id)}/cancel`, { version })
  },

  async completeProject(id: string, version: number): Promise<Project> {
    return apiPost<Project>(`/api/v1/projects/${encodeURIComponent(id)}/complete`, { version })
  },
}
