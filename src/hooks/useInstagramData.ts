'use client'

import { useState, useEffect, useCallback } from 'react'
import { DailyMetric, PostItem } from '@/lib/types'

export interface InstagramData {
  daily: DailyMetric[]
  prevDaily: DailyMetric[]
  posts: PostItem[]
  currentFollowers: number | null
  loading: boolean
  error: string | null
}

export function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function useInstagramData(dateFrom: string, dateTo: string): InstagramData {
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
      const json = await res.json()
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

  return { daily, prevDaily, posts, currentFollowers, loading, error }
}
