'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { DailyMetric } from '@/lib/types'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Props {
  data: DailyMetric[]
}

export function EngagementChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: format(new Date(d.date), 'M/d', { locale: ko }),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">인게이지먼트 추이</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip labelStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="likes" name="좋아요" fill="#f59e0b" stackId="a" />
            <Bar dataKey="comments" name="댓글" fill="#10b981" stackId="a" />
            <Bar dataKey="shares" name="공유" fill="#6366f1" stackId="a" />
            <Bar dataKey="saves" name="저장" fill="#ec4899" stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
