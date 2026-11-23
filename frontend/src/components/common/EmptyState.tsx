import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 sm:p-12 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-200">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" onClick={onAction} leftIcon={actionIcon}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
