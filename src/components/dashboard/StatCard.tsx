'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  value: string
  change?: number          // % vs prev month
  sub?: string             // e.g. "vs 전월"
  note?: string            // small gray note below value
  small?: boolean
  accent?: string          // tailwind border color class
  children?: React.ReactNode
}

export function StatCard({ title, value, change, sub, note, small, accent, children }: Props) {
  const isUp = (change ?? 0) > 0
  const isDown = (change ?? 0) < 0

  return (
    <Card className={cn(small && 'shadow-none border-muted/60', accent && `border-l-4 ${accent}`)}>
      <CardContent className={cn('p-5', small && 'p-4')}>
        <p className={cn('text-muted-foreground mb-1', small ? 'text-xs' : 'text-sm')}>{title}</p>
        <p className={cn('font-bold', small ? 'text-xl' : 'text-2xl')}>{value}</p>
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 mt-1',
            small ? 'text-xs' : 'text-sm',
            isUp ? 'text-emerald-500' : isDown ? 'text-red-500' : 'text-muted-foreground'
          )}>
            {isUp ? <TrendingUp size={12} /> : isDown ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{isUp ? '+' : ''}{change.toFixed(1)}%</span>
            {sub && <span className="text-muted-foreground text-xs">{sub}</span>}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  )
}
