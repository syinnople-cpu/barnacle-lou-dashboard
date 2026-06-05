'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string
  change?: number
  sub?: string
  note?: string
  small?: boolean
  iconBg?: string
  icon?: React.ReactNode
}

export function LightStatCard({ title, value, change, sub, note, small, iconBg, icon }: Props) {
  const isUp = (change ?? 0) > 0
  const isDown = (change ?? 0) < 0

  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-1', small ? 'p-4' : 'p-5')}>
      <div className="flex items-start justify-between">
        <p className={cn('text-gray-500 font-medium', small ? 'text-xs' : 'text-xs tracking-wide')}>{title}</p>
        {icon && (
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg ?? '#F3F4F6' }}>
            {icon}
          </div>
        )}
      </div>
      <p className={cn('font-bold text-gray-900', small ? 'text-xl' : 'text-3xl')}>{value}</p>
      {note && <p className="text-xs text-gray-400">{note}</p>}
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 mt-0.5', small ? 'text-xs' : 'text-xs', isUp ? 'text-emerald-600' : isDown ? 'text-red-500' : 'text-gray-400')}>
          {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : <Minus size={11} />}
          <span className="font-semibold">{isUp ? '+' : ''}{change.toFixed(1)}%</span>
          {sub && <span className="text-gray-400 font-normal">{sub}</span>}
        </div>
      )}
    </div>
  )
}
