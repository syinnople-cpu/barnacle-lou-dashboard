'use client'

import { useState } from 'react'
import { useInstagramData, daysAgo } from '@/hooks/useInstagramData'
import { sumField, pctChange, detectUploadDays, generateInsights, generateYoutubeInsights } from '@/lib/stats'
import { LightStatCard } from './LightStatCard'
import { LightReachChart } from './LightReachChart'
import { LightEngagementChart } from './LightEngagementChart'
import { LightPostFeed } from './LightPostFeed'
import { LightInsights } from './LightInsights'
import { Heart, MessageCircle, Share2, Bookmark, Clock, Users, Radio, Zap, Timer } from 'lucide-react'
import Link from 'next/link'
import { YoutubeContentComparison } from './YoutubeContentComparison'

type Mode = 'week' | 'month' | 'custom'
type Channel = 'ddagaebi' | 'kocomong'

const CHANNELS: { id: Channel; label: string; platform: string }[] = [
  { id: 'ddagaebi', label: '따개비루', platform: 'IG' },
  { id: 'kocomong', label: '코코몽', platform: 'YT' },
]

function firstDayOfMonth() {
  const d = new Date()
  d.setDate(1)
  return d.toISOString().slice(0, 10)
}

export function LightDashboard() {
  const todayStr = new Date().toISOString().slice(0, 10)
  const [mode, setMode] = useState<Mode>('month')
  const [customFrom, setCustomFrom] = useState(daysAgo(29))
  const [customTo, setCustomTo] = useState(todayStr)
  const [channel, setChannel] = useState<Channel>('ddagaebi')

  const dateFrom = mode === 'week' ? daysAgo(6) : mode === 'month' ? firstDayOfMonth() : customFrom
  const dateTo = mode === 'custom' ? customTo : todayStr
  const compare: 'week' | 'month' = mode === 'week' ? 'week' : 'month'
  const compareLabel = mode === 'week' ? 'vs 전주' : 'vs 전월'

  const { daily, prevDaily, posts, videos, currentFollowers, loading, error } = useInstagramData(dateFrom, dateTo, compare, channel)
  const isYT = channel === 'kocomong'

  const totalReach = sumField(daily, 'reach')
  const totalLikes = sumField(daily, 'likes')
  const totalComments = sumField(daily, 'comments')
  const totalShares = sumField(daily, 'shares')
  const totalSaves = sumField(daily, 'saves')
  const totalEng = totalLikes + totalComments + totalShares + totalSaves
  const prevReach = sumField(prevDaily, 'reach')
  const prevEng = sumField(prevDaily, 'likes') + sumField(prevDaily, 'comments') + sumField(prevDaily, 'shares') + sumField(prevDaily, 'saves')

  // YouTube: 평균 시청 지속 시간
  const avgViewDuration = daily.length > 0
    ? daily.reduce((a, d) => a + (d.avgViewDuration ?? 0), 0) / daily.filter(d => (d.avgViewDuration ?? 0) > 0).length || 0
    : 0
  const prevAvgViewDuration = prevDaily.length > 0
    ? prevDaily.reduce((a, d) => a + (d.avgViewDuration ?? 0), 0) / prevDaily.filter(d => (d.avgViewDuration ?? 0) > 0).length || 0
    : 0

  // YouTube: 업로드 일자 — video 데이터 있으면 사용, 없으면 조회수 급등일로 대체
  const videoUploadDays = videos.length > 0
    ? [...new Set(videos.map(v => v.date))]
    : detectUploadDays(daily)

  // YouTube: 예상 수익 합계
  const totalRevenue = daily.reduce((sum, d) => sum + (d.estimatedRevenue ?? 0), 0)
  const prevRevenue = prevDaily.reduce((sum, d) => sum + (d.estimatedRevenue ?? 0), 0)

  const uploadDays = detectUploadDays(daily)
  const insights = channel === 'kocomong' ? generateYoutubeInsights(daily) : generateInsights(daily)

  return (
    <div className="min-h-screen" style={{ background: '#F4F6FA' }}>
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm hidden md:flex">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">O</div>
              <div>
                <p className="text-sm font-bold text-gray-900">올리브스튜디오</p>
                <p className="text-xs text-gray-400">olivestudio</p>
              </div>
            </div>
          </div>
          <nav className="p-4 flex-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">채널</p>
            <div className="space-y-1">
              {CHANNELS.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setChannel(ch.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    channel === ch.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className={`text-xs font-bold ${channel === ch.id ? 'text-indigo-500' : 'text-gray-400'}`}>{ch.platform}</span>
                  <span>{ch.label}</span>
                </button>
              ))}
            </div>
          </nav>
          <div className="p-4 border-t border-gray-100">
            <Link href="/design-a" className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              ← 디자인 A 보기
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0">
          {/* Top bar */}
          <div className="bg-white border-b border-gray-100 px-6 py-3.5 sticky top-0 z-10 flex items-center justify-between shadow-sm">
            <div>
              <h1 className="text-base font-bold text-gray-900">{CHANNELS.find(c => c.id === channel)?.platform} {CHANNELS.find(c => c.id === channel)?.label} 대시보드</h1>
              <p className="text-xs text-gray-400">성과 분석 · {compareLabel.replace('vs ', '')} 비교</p>
            </div>
            <div className="flex items-center gap-2">
              {/* 주/월 버튼 */}
              <div className="flex rounded-xl overflow-hidden border border-gray-200 text-xs">
                <button
                  onClick={() => setMode('week')}
                  className={`px-3 py-2 font-medium transition-colors ${mode === 'week' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >주간</button>
                <button
                  onClick={() => setMode('month')}
                  className={`px-3 py-2 font-medium transition-colors border-l border-gray-200 ${mode === 'month' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >월간</button>
                <button
                  onClick={() => setMode('custom')}
                  className={`px-3 py-2 font-medium transition-colors border-l border-gray-200 ${mode === 'custom' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >직접</button>
              </div>
              {/* 날짜 직접 입력 (custom 모드일 때만) */}
              {mode === 'custom' && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600">
                  <input type="date" value={customFrom} max={customTo} onChange={(e) => setCustomFrom(e.target.value)} className="bg-transparent outline-none" />
                  <span className="text-gray-300">~</span>
                  <input type="date" value={customTo} min={customFrom} max={todayStr} onChange={(e) => setCustomTo(e.target.value)} className="bg-transparent outline-none" />
                </div>
              )}
              {/* 주간/월간일 때 날짜 범위 표시 */}
              {mode !== 'custom' && (
                <div className="text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                  {dateFrom} ~ {dateTo}
                </div>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {error && <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm">{error}</div>}

            {loading ? (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm">데이터 불러오는 중...</div>
            ) : (
              <>
                {/* KPI Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <LightStatCard
                    title={isYT ? (currentFollowers && currentFollowers < 10000 ? '신규 유입 구독자' : '현재 구독자') : '현재 팔로워'}
                    value={currentFollowers ? currentFollowers.toLocaleString() + '명' : '—'}
                    icon={<Users size={14} className="text-indigo-500" />}
                    iconBg="#EEF2FF"
                  />
                  <LightStatCard
                    title={isYT ? '총 조회수' : '총 도달수'}
                    value={totalReach.toLocaleString()}
                    change={pctChange(totalReach, prevReach)}
                    sub={compareLabel}
                    icon={<Radio size={14} className="text-violet-500" />}
                    iconBg="#F5F3FF"
                  />
                  <LightStatCard
                    title={isYT ? '총 시청시간(분)' : '총 인게이지먼트'}
                    value={isYT ? totalSaves.toLocaleString() : totalEng.toLocaleString()}
                    change={isYT ? pctChange(totalSaves, sumField(prevDaily,'saves')) : pctChange(totalEng, prevEng)}
                    sub={compareLabel}
                    icon={isYT ? <Clock size={14} className="text-pink-500" /> : <Zap size={14} className="text-pink-500" />}
                    iconBg="#FDF2F8"
                  />
                </div>

                {/* KPI Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <LightStatCard title="좋아요" value={totalLikes.toLocaleString()} change={pctChange(totalLikes, sumField(prevDaily,'likes'))} sub={compareLabel} small icon={<Heart size={12} className="text-amber-500" />} iconBg="#FFFBEB" />
                  {isYT
                    ? <LightStatCard title="예상 수익" value={totalRevenue > 0 ? `$${totalRevenue.toFixed(2)}` : '—'} change={pctChange(totalRevenue, prevRevenue)} sub={compareLabel} small icon={<Zap size={12} className="text-emerald-500" />} iconBg="#F0FDF4" />
                    : <LightStatCard title="댓글" value={totalComments.toLocaleString()} change={pctChange(totalComments, sumField(prevDaily,'comments'))} sub={compareLabel} small icon={<MessageCircle size={12} className="text-emerald-500" />} iconBg="#F0FDF4" />
                  }
                  <LightStatCard title="공유" value={totalShares.toLocaleString()} change={pctChange(totalShares, sumField(prevDaily,'shares'))} sub={compareLabel} small icon={<Share2 size={12} className="text-sky-500" />} iconBg="#F0F9FF" />
                  {isYT
                    ? <LightStatCard title="총 인게이지먼트" value={totalEng.toLocaleString()} change={pctChange(totalEng, prevEng)} sub={compareLabel} small icon={<MessageCircle size={12} className="text-rose-500" />} iconBg="#FFF1F2" />
                    : <LightStatCard title="저장" value={totalSaves.toLocaleString()} change={pctChange(totalSaves, sumField(prevDaily,'saves'))} sub={compareLabel} small icon={<Bookmark size={12} className="text-rose-500" />} iconBg="#FFF1F2" />
                  }
                </div>

                {/* Post feed — IG만 표시 */}
                {!isYT && posts.length > 0 && <LightPostFeed posts={posts} />}

                {/* Charts */}
                <LightReachChart
                  data={daily}
                  uploadDays={isYT ? videoUploadDays : uploadDays}
                  channel={channel}
                />
                <LightEngagementChart data={daily} channel={channel} />

                {/* YouTube 전용: 롱폼 vs 숏폼 비교 */}
                {isYT && <YoutubeContentComparison videos={videos} />}

                {/* Insights */}
                <LightInsights insights={insights} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
