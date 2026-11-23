import { apiGet, apiPost } from './apiClient'

export type Proposal = {
  id: string
  projectId: string
  coverLetter: string
  proposedAmount: number
  deliveryDays: number
  status: 'SUBMITTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN' | string
  version: number
  createdAt?: string
  updatedAt?: string
}

export type ProposalPage = {
  proposals: Proposal[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

export type CreateProposalInput = {
  coverLetter: string
  proposedAmount: number
  deliveryDays: number
}

export type AcceptProposalInput = {
  projectVersion: number
  proposalVersion: number
}

export const proposalService = {
  async getProjectProposals(projectId: string, page = 0, size = 10, signal?: AbortSignal): Promise<ProposalPage> {
    return apiGet<ProposalPage>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/proposals?page=${page}&size=${size}`,
      { signal }
    )
  },

  async getMyProposals(page = 0, size = 10, signal?: AbortSignal): Promise<ProposalPage> {
    return apiGet<ProposalPage>(`/api/v1/proposals/mine?page=${page}&size=${size}`, { signal })
  },

  async createProposal(projectId: string, input: CreateProposalInput): Promise<Proposal> {
    return apiPost<Proposal>(`/api/v1/projects/${encodeURIComponent(projectId)}/proposals`, input)
  },

  async acceptProposal(projectId: string, proposalId: string, input: AcceptProposalInput): Promise<Proposal> {
    return apiPost<Proposal>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/proposals/${encodeURIComponent(proposalId)}/accept`,
      input
    )
  },

  async withdrawProposal(projectId: string, proposalId: string, version: number): Promise<Proposal> {
    return apiPost<Proposal>(
      `/api/v1/projects/${encodeURIComponent(projectId)}/proposals/${encodeURIComponent(proposalId)}/withdraw`,
      { version }
    )
  },
}
