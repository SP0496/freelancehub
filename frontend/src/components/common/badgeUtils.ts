import type { BadgeProps } from './Badge'

export function getStatusBadgeVariant(status: string): BadgeProps['variant'] {
  switch (status.toUpperCase()) {
    case 'OPEN':
    case 'ACCEPTED':
    case 'ACTIVE':
    case 'COMPLETED':
      return 'success'
    case 'IN_PROGRESS':
    case 'SUBMITTED':
    case 'PENDING':
      return 'warning'
    case 'REJECTED':
    case 'CANCELLED':
    case 'WITHDRAWN':
      return 'error'
    default:
      return 'neutral'
  }
}
