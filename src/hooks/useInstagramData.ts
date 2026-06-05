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

const API_KEY = process.env.NEXT_PUBLIC_WINDSOR_API_KEY ?? ''
const BASE = 'https://connectors.windsor.ai/instagram'
const FIELDS = 'date,account_name,reach,likes,comments,shares,saves,media_url,media_type,followers_count'

function prevMonth(dateStr: string): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

type RawRow = {
  date: string
  reach: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  media_url: string | null
  media_type: string | null
  followers_count: number | null
}

function parseRows(rows: RawRow[]) {
  const postRows = rows.filter((r) => r.media_url)
  const dailyRows = rows.filter((r) => !r.media_url && r.reach != null)

  const dailyMap = new Map<string, { reach: number; likes: number; comments: number; shares: number; saves: number }>()
  for (const r of dailyRows) {
    dailyMap.set(r.date, {
      reach: Math.abs(Number(r.reach ?? 0)),
      likes: Math.abs(Number(r.likes ?? 0)),
      comments: Math.abs(Number(r.comments ?? 0)),
      shares: Math.abs(Number(r.shares ?? 0)),
      saves: Math.abs(Number(r.saves ?? 0)),
    })
  }

  const postByDate = new Map<string, { date: string; mediaUrl: string; mediaType: string }>()
  for (const r of postRows) {
    const existing = postByDate.get(r.date)
    if (!existing || r.media_type === 'IMAGE' || r.media_type === 'CAROUSEL_ALBUM') {
      postByDate.set(r.date, { date: r.date, mediaUrl: r.media_url!, mediaType: r.media_type ?? 'IMAGE' })
    }
  }

  const posts = Array.from(postByDate.values()).map((p) => {
    const m = dailyMap.get(p.date) ?? { reach: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    return { ...p, ...m }
  }).sort((a, b) => a.date.localeCompare(b.date))

  const daily = Array.from(dailyMap.entries())
    .map(([date, m]) => ({ date, ...m }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return { daily, posts }
}

async function fetchWindsor(dateFrom: string, dateTo: string) {
  const url = `${BASE}?api_key=${API_KEY}&fields=${FIELDS}&date_from=${dateFrom}&date_to=${dateTo}`
  const res = await fetch(url)
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data ?? []
}

async function fetchFollowers() {
  const url = `${BASE}?api_key=${API_KEY}&fields=date,account_name,followers_count`
  const res = await fetch(url)
  const json = await res.json()
  return json.data?.[0]?.followers_count ?? null
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
      const [curRows, prevRows, followers] = await Promise.all([
        fetchWindsor(from, to),
        fetchWindsor(prevMonth(from), prevMonth(to)),
        fetchFollowers(),
      ])
      const { daily: cur, posts: p } = parseRows(curRows)
      const { daily: prev } = parseRows(prevRows)
      setDaily(cur)
      setPrevDaily(prev)
      setPosts(p)
      setCurrentFollowers(followers)
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로드 실패')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData(dateFrom, dateTo) }, [dateFrom, dateTo, fetchData])

  return { daily, prevDaily, posts, currentFollowers, loading, error }
}
