'use client'

import { Insight } from '@/lib/types'
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'

const cfg = {
  up: { icon: TrendingUp, color: '#10B981', bg: '#10B98115', border: '#10B98130' },
  down: { icon: TrendingDown, color: '#EF4444', bg: '#EF444415', border: '#EF444430' },
  tip: { icon: Lightbulb, color: '#F59E0B', bg: '#F59E0B15', border: '#F59E0B30' },
}

export function DarkInsights({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-4">채널 인사이트 & 콘텐츠 제안</p>
      <div className="space-y-2">
        {insights.map((ins, i) => {
          const { icon: Icon, color, bg, border } = cfg[ins.type]
          return (
            <div key={i} className="rounded-xl p-3 border" style={{ background: bg, borderColor: border }}>
              <div className="flex items-start gap-2">
                <Icon size={13} style={{ color }} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{ins.title}</p>
                  <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{ins.body}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
