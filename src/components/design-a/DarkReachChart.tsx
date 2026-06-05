'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { DailyMetric } from '@/lib/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props { data: DailyMetric[]; uploadDays: string[] }

export function DarkReachChart({ data, uploadDays }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'M/d', { locale: ko }),
  }))
  const uploadSet = new Set(uploadDays)

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/50 uppercase tracking-wide font-medium">도달수 추이</p>
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          업로드 추정일
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="darkReachGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#ffffff50' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#ffffff50' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={35} />
          <Tooltip
            contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 12, fontSize: 12, color: '#fff' }}
            formatter={(v: number) => [v.toLocaleString(), '도달수']}
          />
          {uploadDays.map((date) => {
            const found = formatted.find((d) => d.date === date)
            return found ? <ReferenceLine key={date} x={found.label} stroke="#f43f5e80" strokeDasharray="4 3" strokeWidth={1.5} /> : null
          })}
          <Area type="monotone" dataKey="reach" stroke="#8B5CF6" fill="url(#darkReachGrad)" strokeWidth={2}
            dot={(props) => {
              const { cx, cy, payload } = props
              return uploadSet.has(payload.date)
                ? <circle key={payload.date} cx={cx} cy={cy} r={4} fill="#f43f5e" stroke="#0a0a0f" strokeWidth={2} />
                : <g key={payload.date} />
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
