'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Insight } from '@/lib/types'
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  insights: Insight[]
}

const config = {
  up: { icon: TrendingUp, bg: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600', badge: '상승 요인' },
  down: { icon: TrendingDown, bg: 'bg-red-50 border-red-200', iconColor: 'text-red-500', badge: '하락 요인' },
  tip: { icon: Lightbulb, bg: 'bg-amber-50 border-amber-200', iconColor: 'text-amber-500', badge: '인사이트 & 제안' },
}

export function InsightsCard({ insights }: Props) {
  if (insights.length === 0) return null

  const grouped = {
    up: insights.filter((i) => i.type === 'up'),
    down: insights.filter((i) => i.type === 'down'),
    tip: insights.filter((i) => i.type === 'tip'),
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">채널 인사이트 & 콘텐츠 제안</CardTitle>
        <p className="text-xs text-muted-foreground">선택 기간 데이터를 분석한 결과입니다</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {(['up', 'down', 'tip'] as const).map((type) => {
            const items = grouped[type]
            if (items.length === 0) return null
            const { icon: Icon, bg, iconColor, badge } = config[type]
            return (
              <div key={type}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{badge}</p>
                <div className="space-y-2">
                  {items.map((insight, i) => (
                    <div key={i} className={cn('rounded-lg border p-3', bg)}>
                      <div className="flex items-start gap-2">
                        <Icon size={14} className={cn('mt-0.5 shrink-0', iconColor)} />
                        <div>
                          <p className="text-sm font-semibold">{insight.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
