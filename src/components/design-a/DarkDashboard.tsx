'use client'

import { useState } from 'react'
import { useInstagramData, daysAgo } from '@/hooks/useInstagramData'
import { sumField, pctChange, detectUploadDays, generateInsights, getTopPosts } from '@/lib/stats'
import { DarkStatCard } from './DarkStatCard'
import { DarkReachChart } from './DarkReachChart'
import { DarkEngagementChart } from './DarkEngagementChart'
import { DarkContentList } from './DarkContentList'
import { DarkInsights } from './DarkInsights'
import Link from 'next/link'

export function DarkDashboard() {
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
  const topPosts = getTopPosts(posts, 5)
  const insights = generateInsights(daily)

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0F', color: '#fff' }}>
      {/* Nav */}
      <nav className="border-b border-white/8 px-6 py-4 sticky top-0 z-10 backdrop-blur-xl" style={{ background: '#0A0A0Fcc' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold">따</div>
            <div>
              <p className="text-sm font-semibold">따개비루</p>
              <p className="text-xs text-white/40">Instagram · barnacle_lou</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/8 rounded-xl px-3 py-2 text-xs border border-white/10">
              <input type="date" value={dateFrom} max={dateTo} onChange={(e) => setDateFrom(e.target.value)}
                className="bg-transparent text-white/70 outline-none" />
              <span className="text-white/30">~</span>
              <input type="date" value={dateTo} min={dateFrom} max={new Date().toISOString().slice(0,10)} onChange={(e) => setDateTo(e.target.value)}
                className="bg-transparent text-white/70 outline-none" />
            </div>
            <Link href="/design-b" className="text-xs text-white/40 hover:text-white/70 border border-white/10 rounded-lg px-3 py-2 transition-colors">
              디자인 B →
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-5">
        {error && <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-white/30 text-sm">데이터 불러오는 중...</div>
        ) : (
          <>
            {/* KPI Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <DarkStatCard title="현재 팔로워" value={currentFollowers ? currentFollowers.toLocaleString() + '명' : '—'} note="팔로워 유입수 미지원" accent="#6366F1" />
              <DarkStatCard title="총 도달수" value={totalReach.toLocaleString()} change={pctChange(totalReach, prevReach)} sub="vs 전월" accent="#8B5CF6" />
              <DarkStatCard title="총 인게이지먼트" value={totalEng.toLocaleString()} change={pctChange(totalEng, prevEng)} sub="vs 전월" accent="#EC4899" />
            </div>

            {/* KPI Row 2 */}
            <div className="grid grid-cols-4 gap-3">
              <DarkStatCard title="좋아요" value={totalLikes.toLocaleString()} change={pctChange(totalLikes, sumField(prevDaily,'likes'))} sub="vs 전월" small accent="#F59E0B" />
              <DarkStatCard title="댓글" value={totalComments.toLocaleString()} change={pctChange(totalComments, sumField(prevDaily,'comments'))} sub="vs 전월" small accent="#10B981" />
              <DarkStatCard title="공유" value={totalShares.toLocaleString()} change={pctChange(totalShares, sumField(prevDaily,'shares'))} sub="vs 전월" small accent="#60A5FA" />
              <DarkStatCard title="저장" value={totalSaves.toLocaleString()} change={pctChange(totalSaves, sumField(prevDaily,'saves'))} sub="vs 전월" small accent="#F472B6" />
            </div>

            {/* Content uploaded */}
            {posts.length > 0 && <DarkContentList posts={posts} />}

            {/* Charts */}
            <DarkReachChart data={daily} uploadDays={uploadDays} />
            <DarkEngagementChart data={daily} />

            {/* Top posts */}
            {topPosts.length > 0 && <DarkContentList posts={topPosts} topN={5} />}

            {/* Insights */}
            <DarkInsights insights={insights} />
          </>
        )}
      </div>
    </div>
  )
}
