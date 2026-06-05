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
  accent?: string // hex color for glow
}

export function DarkStatCard({ title, value, change, sub, note, small, accent }: Props) {
  const isUp = (change ?? 0) > 0
  const isDown = (change ?? 0) < 0

  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 flex flex-col gap-1',
        small && 'p-4',
      )}
      style={accent ? { boxShadow: `inset 0 0 0 1px ${accent}22, 0 0 24px ${accent}18` } : undefined}
    >
      <p className={cn('text-white/50 font-medium', small ? 'text-xs' : 'text-xs tracking-wide uppercase')}>{title}</p>
      <p className={cn('font-bold text-white', small ? 'text-xl' : 'text-3xl')}>{value}</p>
      {note && <p className="text-xs text-white/30">{note}</p>}
      {change !== undefined && (
        <div className={cn('flex items-center gap-1 text-xs mt-0.5', isUp ? 'text-emerald-400' : isDown ? 'text-red-400' : 'text-white/40')}>
          {isUp ? <TrendingUp size={11} /> : isDown ? <TrendingDown size={11} /> : <Minus size={11} />}
          <span>{isUp ? '+' : ''}{change.toFixed(1)}%</span>
          {sub && <span className="text-white/30">{sub}</span>}
        </div>
      )}
    </div>
  )
}
