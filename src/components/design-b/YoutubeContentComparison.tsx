'use client'

import { YoutubeVideo } from '@/lib/types'

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
}

function fmt(n: number) {
  return n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString()
}

function Bar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
    </div>
  )
}

export function YoutubeContentComparison({ videos }: { videos: YoutubeVideo[] }) {
  const shorts = videos.filter((v) => v.type === 'shorts')
  const longform = videos.filter((v) => v.type === 'longform')

  if (videos.length === 0) return null

  const metrics = [
    { label: '평균 조회수', shorts: avg(shorts.map((v) => v.views)), long: avg(longform.map((v) => v.views)), fmt: (n: number) => fmt(Math.round(n)) },
    { label: '평균 좋아요', shorts: avg(shorts.map((v) => v.likes)), long: avg(longform.map((v) => v.likes)), fmt: (n: number) => fmt(Math.round(n)) },
    { label: '평균 댓글', shorts: avg(shorts.map((v) => v.comments)), long: avg(longform.map((v) => v.comments)), fmt: (n: number) => fmt(Math.round(n)) },
    { label: '평균 공유', shorts: avg(shorts.map((v) => v.shares)), long: avg(longform.map((v) => v.shares)), fmt: (n: number) => fmt(Math.round(n)) },
    { label: '평균 시청시간(분)', shorts: avg(shorts.map((v) => v.watchMinutes)), long: avg(longform.map((v) => v.watchMinutes)), fmt: (n: number) => Math.round(n).toLocaleString() },
  ]

  const rows: { label: string; shorts: number; long: number; fmt: (n: number) => string }[] = metrics

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-800 mb-1">콘텐츠 유형별 성과 비교</p>
      <p className="text-xs text-gray-400 mb-4">숏폼(≤3분) vs 롱폼(&gt;3분) · 선택 기간 영상 기준</p>

      {/* 헤더 */}
      <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 mb-3 px-1">
        <span>지표</span>
        <span className="text-center text-rose-500">🩳 숏폼 ({shorts.length}개)</span>
        <span className="text-center text-indigo-500">🎬 롱폼 ({longform.length}개)</span>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const total = row.shorts + row.long
          const shortsPct = total > 0 ? (row.shorts / total) * 100 : 50
          const longPct = total > 0 ? (row.long / total) * 100 : 50
          const shortsWins = row.shorts >= row.long
          return (
            <div key={row.label}>
              <div className="grid grid-cols-3 text-xs mb-1.5 items-center">
                <span className="text-gray-500">{row.label}</span>
                <span className={`text-center font-bold ${shortsWins ? 'text-rose-500' : 'text-gray-400'}`}>
                  {row.fmt(row.shorts)} {shortsWins && shorts.length > 0 && longform.length > 0 ? '👑' : ''}
                </span>
                <span className={`text-center font-bold ${!shortsWins ? 'text-indigo-500' : 'text-gray-400'}`}>
                  {row.fmt(row.long)} {!shortsWins && shorts.length > 0 && longform.length > 0 ? '👑' : ''}
                </span>
              </div>
              <div className="flex gap-1">
                <Bar pct={shortsPct} color="#FB7185" />
                <Bar pct={longPct} color="#818CF8" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
