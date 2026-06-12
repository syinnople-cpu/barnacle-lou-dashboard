'use client'

import { useState, useEffect, useCallback } from 'react'
import { DailyMetric, PostItem, YoutubeVideo } from '@/lib/types'

export interface InstagramData {
  daily: DailyMetric[]
  prevDaily: DailyMetric[]
  posts: PostItem[]
  videos: YoutubeVideo[]
  currentFollowers: number | null
  loading: boolean
  error: string | null
}

export function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function useInstagramData(dateFrom: string, dateTo: string, compare: 'month' | 'week' = 'month', account = 'ddagaebi'): InstagramData {
  const [daily, setDaily] = useState<DailyMetric[]>([])
  const [prevDaily, setPrevDaily] = useState<DailyMetric[]>([])
  const [posts, setPosts] = useState<PostItem[]>([])
  const [videos, setVideos] = useState<YoutubeVideo[]>([])
  const [currentFollowers, setCurrentFollowers] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (from: string, to: string, cmp: string, acc: string) => {
    setLoading(true); setError(null)
    setDaily([]); setPrevDaily([]); setPosts([]); setVideos([]); setCurrentFollowers(null)
    try {
      const endpoint = acc === 'kocomong' ? '/api/youtube' : '/api/instagram'
      const accountParam = acc === 'kocomong' ? '' : `&account=${acc}`
      const res = await fetch(`${endpoint}?date_from=${from}&date_to=${to}&compare=${cmp}${accountParam}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setDaily(json.data ?? [])
      setPrevDaily(json.prevData ?? [])
      setPosts(json.posts ?? [])
      setVideos(json.videos ?? [])
      setCurrentFollowers(json.currentFollowers ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(dateFrom, dateTo, compare, account) }, [dateFrom, dateTo, compare, account, fetchData])

  return { daily, prevDaily, posts, videos, currentFollowers, loading, error }
}
