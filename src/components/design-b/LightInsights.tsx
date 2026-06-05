'use client'

import { Insight } from '@/lib/types'
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react'

const cfg = {
  up: { icon: TrendingUp, border: '#10B981', bg: '#F0FDF4', iconColor: '#10B981', badge: '상승 요인', badgeBg: '#DCFCE7', badgeText: '#166534' },
  down: { icon: TrendingDown, border: '#EF4444', bg: '#FFF1F2', iconColor: '#EF4444', badge: '하락 요인', badgeBg: '#FFE4E6', badgeText: '#9F1239' },
  tip: { icon: Lightbulb, border: '#F59E0B', bg: '#FFFBEB', iconColor: '#F59E0B', badge: '제안', badgeBg: '#FEF3C7', badgeText: '#92400E' },
}

export function LightInsights({ insights }: { insights: Insight[] }) {
  if (!insights.length) return null
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-800 mb-1">채널 인사이트 & 콘텐츠 제안</p>
      <p className="text-xs text-gray-400 mb-4">선택 기간 데이터 기반 자동 분석</p>
      <div className="space-y-2.5">
        {insights.map((ins, i) => {
          const { icon: Icon, border, bg, iconColor, badge, badgeBg, badgeText } = cfg[ins.type]
          return (
            <div key={i} className="rounded-xl p-4 border-l-4" style={{ background: bg, borderLeftColor: border }}>
              <div className="flex items-start gap-3">
                <Icon size={14} style={{ color: iconColor }} className="mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: badgeBg, color: badgeText }}>{badge}</span>
                    <p className="text-sm font-semibold text-gray-800">{ins.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{ins.body}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
