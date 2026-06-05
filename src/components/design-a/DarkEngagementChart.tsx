'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { DailyMetric } from '@/lib/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function DarkEngagementChart({ data }: { data: DailyMetric[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'M/d', { locale: ko }),
  }))

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-xs text-white/50 uppercase tracking-wide font-medium mb-4">인게이지먼트 추이</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#ffffff50' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#ffffff50' }} axisLine={false} tickLine={false} width={25} />
          <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #ffffff20', borderRadius: 12, fontSize: 12, color: '#fff' }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#ffffff70' }} />
          <Bar dataKey="likes" name="좋아요" fill="#F59E0B" stackId="a" radius={[0, 0, 0, 0]} />
          <Bar dataKey="comments" name="댓글" fill="#10B981" stackId="a" />
          <Bar dataKey="shares" name="공유" fill="#8B5CF6" stackId="a" />
          <Bar dataKey="saves" name="저장" fill="#EC4899" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
