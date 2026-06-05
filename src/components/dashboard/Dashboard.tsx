'use client'

import { useState, useEffect, useCallback } from 'react'
import { DailyMetric, PostItem } from '@/lib/types'
import { sumField, pctChange, getTopPosts, generateInsights } from '@/lib/stats'
import { StatCard } from './StatCard'
import { ReachChart } from './ReachChart'
import { EngagementChart } from './EngagementChart'
import { ContentList } from './ContentList'
import { TopPostsCard } from './TopPostsCard'
import { InsightsCard } from './InsightsCard'
import { DateRangePicker } from './DateRangePicker'
import { detectUploadDays } from '@/lib/stats'

function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

interface ApiResponse {
  data: DailyMetric[]
  posts: PostItem[]
  prevData: DailyMetric[]
  currentFollowers: number | null
  error?: string
}

export function Dashboard() {
  const [dateFrom, setDateFrom] = useState(daysAgo(29))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))
  const [daily, setDaily] = useState<DailyMetric[]>([])
  const [prevDaily, setPrevDaily] = useState<DailyMetric[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [currentFollowers, setCurrentFollowers] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (from: string, to: string) => {
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/instagram?date_from=${from}&date_to=${to}`)
      const json: ApiResponse = await res.json()
      if (json.error) throw new Error(json.error)
      setDaily(json.data ?? [])
      setPrevDaily(json.prevData ?? [])
      setPosts(json.posts ?? [])
      setCurrentFollowers(json.currentFollowers ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(dateFrom, dateTo) }, [dateFrom, dateTo, fetchData])

  // Current period totals
  const totalReach = sumField(daily, 'reach')
  const totalLikes = sumField(daily, 'likes')
  const totalComments = sumField(daily, 'comments')
  const totalShares = sumField(daily, 'shares')
  const totalSaves = sumField(daily, 'saves')
  const totalEng = totalLikes + totalComments + totalShares + totalSaves

  // Previous month totals for comparison
  const prevReach = sumField(prevDaily, 'reach')
  const prevLikes = sumField(prevDaily, 'likes')
  const prevComments = sumField(prevDaily, 'comments')
  const prevShares = sumField(prevDaily, 'shares')
  const prevSaves = sumField(prevDaily, 'saves')
  const prevEng = prevLikes + prevComments + prevShares + prevSaves

  const uploadDays = detectUploadDays(daily)
  const topPosts = getTopPosts(posts.length > 0 ? posts : [], 5)
  const insights = generateInsights(daily)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">따개비루 대시보드</h1>
            <p className="text-xs text-muted-foreground">Instagram · barnacle_lou</p>
          </div>
          <DateRangePicker dateFrom={dateFrom} dateTo={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">데이터 불러오는 중...</div>
        ) : (
          <>
            {/* Row 1: Followers | Reach | Engagement */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Followers */}
              <StatCard
                title="현재 팔로워"
                value={currentFollowers ? currentFollowers.toLocaleString() + '명' : '—'}
                note="팔로워 유입수: Windsor.ai 미지원"
                accent="border-indigo-400"
              />
              <StatCard
                title="총 도달수"
                value={totalReach.toLocaleString()}
                change={pctChange(totalReach, prevReach)}
                sub="vs 전월"
                accent="border-violet-400"
              />
              <StatCard
                title="총 인게이지먼트"
                value={totalEng.toLocaleString()}
                change={pctChange(totalEng, prevEng)}
                sub="vs 전월"
                accent="border-pink-400"
              />
            </div>

            {/* Row 2: Likes | Comments | Shares | Saves */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard title="좋아요" value={totalLikes.toLocaleString()} change={pctChange(totalLikes, prevLikes)} sub="vs 전월" small accent="border-amber-400" />
              <StatCard title="댓글" value={totalComments.toLocaleString()} change={pctChange(totalComments, prevComments)} sub="vs 전월" small accent="border-emerald-400" />
              <StatCard title="공유" value={totalShares.toLocaleString()} change={pctChange(totalShares, prevShares)} sub="vs 전월" small accent="border-sky-400" />
              <StatCard title="저장" value={totalSaves.toLocaleString()} change={pctChange(totalSaves, prevSaves)} sub="vs 전월" small accent="border-rose-400" />
            </div>

            {/* Content list (upload posts) */}
            <ContentList posts={posts} />

            {/* Reach chart with upload markers */}
            <ReachChart data={daily} uploadDays={uploadDays} />

            {/* Engagement bar chart */}
            <EngagementChart data={daily} />

            {/* Top performing content */}
            {topPosts.length > 0 && <TopPostsCard posts={topPosts} />}

            {/* Insights */}
            <InsightsCard insights={insights} />
          </>
        )}
      </div>
    </div>
  )
}
