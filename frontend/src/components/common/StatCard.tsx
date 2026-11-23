import React from 'react'
import type { LucideIcon } from 'lucide-react'

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  color?: 'primary' | 'blue' | 'green' | 'amber'
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  subtitle,
  color = 'primary',
}) => {
  const iconColors = {
    primary: 'bg-slate-100 text-slate-800 border-slate-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-heading">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
