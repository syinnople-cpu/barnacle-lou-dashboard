'use client'

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { DailyMetric } from '@/lib/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function LightEngagementChart({ data }: { data: DailyMetric[] }) {
  const formatted = data.map((d) => ({ ...d, label: format(new Date(d.date), 'M/d', { locale: ko }) }))
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-800 mb-1">인게이지먼트 추이</p>
      <p className="text-xs text-gray-400 mb-4">좋아요 · 댓글 · 공유 · 저장</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F9FAFB" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={25} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 12, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#6B7280' }} />
          <Bar dataKey="likes" name="좋아요" fill="#FCD34D" stackId="a" />
          <Bar dataKey="comments" name="댓글" fill="#6EE7B7" stackId="a" />
          <Bar dataKey="shares" name="공유" fill="#A5B4FC" stackId="a" />
          <Bar dataKey="saves" name="저장" fill="#FBCFE8" stackId="a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
