'use client'

import { useState } from 'react'
import { useInstagramData, daysAgo } from '@/hooks/useInstagramData'
import { sumField, pctChange, detectUploadDays, generateInsights } from '@/lib/stats'
import { LightStatCard } from './LightStatCard'
import { LightReachChart } from './LightReachChart'
import { LightEngagementChart } from './LightEngagementChart'
import { LightPostFeed } from './LightPostFeed'
import { LightInsights } from './LightInsights'
import { Heart, MessageCircle, Share2, Bookmark, Users, Radio, Zap } from 'lucide-react'
import Link from 'next/link'

export function LightDashboard() {
  const [dateFrom, setDateFrom] = useState(daysAgo(29))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))
  const { daily, prevDaily, posts, currentFollowers, loading, error } = useInstagramData(dateFrom, dateTo)

  const totalReach = sumField(daily, 'reach')
  const totalLikes = sumField(daily, 'likes')
  const totalComments = sumField(daily, 'comments')
  const totalShares = sumField(daily, 'shares')
  const totalSaves = sumField(daily, 'saves')
  const totalEng = totalLikes + totalComments + totalShares + totalSaves
  const prevReach = sumField(prevDaily, 'reach')
  const prevEng = sumField(prevDaily, 'likes') + sumField(prevDaily, 'comments') + sumField(prevDaily, 'shares') + sumField(prevDaily, 'saves')

  const uploadDays = detectUploadDays(daily)
  const insights = generateInsights(daily)

  return (
    <div className="min-h-screen" style={{ background: '#F4F6FA' }}>
      {/* Sidebar + Main layout */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 flex flex-col shadow-sm hidden md:flex">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">따</div>
              <div>
                <p className="text-sm font-bold text-gray-900">따개비루</p>
                <p className="text-xs text-gray-400">barnacle_lou</p>
              </div>
            </div>
          </div>
          <nav className="p-4 flex-1">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">채널</p>
            <div className="space-y-1">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700">
                <span className="text-indigo-500 text-xs font-bold">IG</span>
                <span className="text-xs font-semibold">따개비루</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-gray-400 text-xs">
                <span className="w-3.5 h-3.5 rounded border-2 border-dashed border-gray-300 inline-block" />
                <span>채널 추가 예정</span>
              </div>
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
              <h1 className="text-base font-bold text-gray-900">인스타그램 대시보드</h1>
              <p className="text-xs text-gray-400">성과 분석 · 전월 비교</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600">
                <input type="date" value={dateFrom} max={dateTo} onChange={(e) => setDateFrom(e.target.value)} className="bg-transparent outline-none" />
                <span className="text-gray-300">~</span>
                <input type="date" value={dateTo} min={dateFrom} max={new Date().toISOString().slice(0,10)} onChange={(e) => setDateTo(e.target.value)} className="bg-transparent outline-none" />
              </div>
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
                    title="현재 팔로워"
                    value={currentFollowers ? currentFollowers.toLocaleString() + '명' : '—'}
                    note="팔로워 유입수 미지원"
                    icon={<Users size={14} className="text-indigo-500" />}
                    iconBg="#EEF2FF"
                  />
                  <LightStatCard
                    title="총 도달수"
                    value={totalReach.toLocaleString()}
                    change={pctChange(totalReach, prevReach)}
                    sub="vs 전월"
                    icon={<Radio size={14} className="text-violet-500" />}
                    iconBg="#F5F3FF"
                  />
                  <LightStatCard
                    title="총 인게이지먼트"
                    value={totalEng.toLocaleString()}
                    change={pctChange(totalEng, prevEng)}
                    sub="vs 전월"
                    icon={<Zap size={14} className="text-pink-500" />}
                    iconBg="#FDF2F8"
                  />
                </div>

                {/* KPI Row 2 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <LightStatCard title="좋아요" value={totalLikes.toLocaleString()} change={pctChange(totalLikes, sumField(prevDaily,'likes'))} sub="vs 전월" small icon={<Heart size={12} className="text-amber-500" />} iconBg="#FFFBEB" />
                  <LightStatCard title="댓글" value={totalComments.toLocaleString()} change={pctChange(totalComments, sumField(prevDaily,'comments'))} sub="vs 전월" small icon={<MessageCircle size={12} className="text-emerald-500" />} iconBg="#F0FDF4" />
                  <LightStatCard title="공유" value={totalShares.toLocaleString()} change={pctChange(totalShares, sumField(prevDaily,'shares'))} sub="vs 전월" small icon={<Share2 size={12} className="text-sky-500" />} iconBg="#F0F9FF" />
                  <LightStatCard title="저장" value={totalSaves.toLocaleString()} change={pctChange(totalSaves, sumField(prevDaily,'saves'))} sub="vs 전월" small icon={<Bookmark size={12} className="text-rose-500" />} iconBg="#FFF1F2" />
                </div>

                {/* Post feed */}
                {posts.length > 0 && <LightPostFeed posts={posts} />}

                {/* Charts */}
                <LightReachChart data={daily} uploadDays={uploadDays} />
                <LightEngagementChart data={daily} />

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
