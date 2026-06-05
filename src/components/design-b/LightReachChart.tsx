'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts'
import { DailyMetric } from '@/lib/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props { data: DailyMetric[]; uploadDays: string[] }

export function LightReachChart({ data, uploadDays }: Props) {
  const formatted = data.map((d) => ({ ...d, label: format(new Date(d.date), 'M/d', { locale: ko }) }))
  const uploadSet = new Set(uploadDays)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-800">도달수 추이</p>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />
          업로드 추정일
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">선택 기간 일별 채널 도달수</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted}>
          <defs>
            <linearGradient id="lightReachGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} width={35} />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12 }}
            formatter={(v: number) => [v.toLocaleString(), '도달수']}
          />
          {uploadDays.map((date) => {
            const found = formatted.find((d) => d.date === date)
            return found ? <ReferenceLine key={date} x={found.label} stroke="#FB7185" strokeDasharray="4 3" strokeWidth={1.5} /> : null
          })}
          <Area type="monotone" dataKey="reach" stroke="#6366F1" fill="url(#lightReachGrad)" strokeWidth={2.5}
            dot={(props) => {
              const { cx, cy, payload } = props
              return uploadSet.has(payload.date)
                ? <circle key={payload.date} cx={cx} cy={cy} r={4} fill="#F43F5E" stroke="#fff" strokeWidth={2} />
                : <g key={payload.date} />
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
