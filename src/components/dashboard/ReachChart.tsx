'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine,
} from 'recharts'
import { DailyMetric } from '@/lib/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  data: DailyMetric[]
  uploadDays: string[]
}

export function ReachChart({ data, uploadDays }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'M/d', { locale: ko }),
  }))

  const uploadSet = new Set(uploadDays)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">도달수 추이</CardTitle>
        <p className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full bg-rose-400 mr-1" />
          도달 급등일 (콘텐츠 업로드 추정)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="reachGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={40} />
            <Tooltip
              formatter={(v) => [Number(v).toLocaleString(), '도달수']}
              labelStyle={{ fontSize: 12 }}
            />
            {uploadDays.map((date) => {
              const found = formatted.find((d) => d.date === date)
              if (!found) return null
              return (
                <ReferenceLine
                  key={date}
                  x={found.label}
                  stroke="#f43f5e"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                />
              )
            })}
            <Area
              type="monotone"
              dataKey="reach"
              stroke="#6366f1"
              fill="url(#reachGrad)"
              strokeWidth={2}
              dot={(props) => {
                const { cx, cy, payload } = props
                if (uploadSet.has(payload.date)) {
                  return <circle key={payload.date} cx={cx} cy={cy} r={4} fill="#f43f5e" stroke="#fff" strokeWidth={1.5} />
                }
                return <g key={payload.date} />
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
