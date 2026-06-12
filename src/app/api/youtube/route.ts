import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.WINDSOR_API_KEY ?? process.env.NEXT_PUBLIC_WINDSOR_API_KEY ?? ''
const BASE = 'https://connectors.windsor.ai/youtube'
const BASE_ALL = 'https://connectors.windsor.ai/all'

const DAILY_FIELDS = 'date,account_name,views,likes,comments,shares,estimated_minutes_watched,average_view_duration,subscribers_gained,subscribers_lost,estimated_revenue'
const VIDEO_FIELDS = 'date,video_id,video_title,video_duration,views,likes,comments,shares,estimated_minutes_watched,average_view_duration'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://windsor.ai/',
  'Origin': 'https://windsor.ai',
}

function prevMonth(dateStr: string): string {
  const d = new Date(dateStr); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 10)
}
function shiftDays(dateStr: string, days: number): string {
  const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10)
}

type RawDailyRow = {
  date: string
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  estimated_minutes_watched: number | null
  average_view_duration: number | null
  subscribers_gained: number | null
  subscribers_lost: number | null
  estimated_revenue: number | null
}

type RawVideoRow = {
  date: string
  video_id: string | null
  video_title: string | null
  video_duration: number | null
  views: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  estimated_minutes_watched: number | null
  average_view_duration: number | null
}

function parseDailyRows(rows: RawDailyRow[]) {
  const daily = rows
    .filter((r) => r.date && (r.views != null || r.likes != null))
    .map((r) => ({
      date: r.date,
      reach: Math.abs(Number(r.views ?? 0)),
      likes: Math.abs(Number(r.likes ?? 0)),
      comments: Math.abs(Number(r.comments ?? 0)),
      shares: Math.abs(Number(r.shares ?? 0)),
      saves: Math.abs(Number(r.estimated_minutes_watched ?? 0)),
      avgViewDuration: Math.abs(Number(r.average_view_duration ?? 0)),
      estimatedRevenue: Number(r.estimated_revenue ?? 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
  return daily
}

function parseVideoRows(rows: RawVideoRow[]) {
  return rows
    .filter((r) => r.video_id)
    .map((r) => {
      const duration = Math.abs(Number(r.video_duration ?? 0))
      return {
        videoId: r.video_id!,
        title: r.video_title ?? '',
        date: r.date,
        duration,
        views: Math.abs(Number(r.views ?? 0)),
        likes: Math.abs(Number(r.likes ?? 0)),
        comments: Math.abs(Number(r.comments ?? 0)),
        shares: Math.abs(Number(r.shares ?? 0)),
        watchMinutes: Math.abs(Number(r.estimated_minutes_watched ?? 0)),
        avgViewDuration: Math.abs(Number(r.average_view_duration ?? 0)),
        type: (duration <= 180 ? 'shorts' : 'longform') as 'shorts' | 'longform',
      }
    })
    .sort((a, b) => b.views - a.views)
}

async function windsorDaily(dateFrom: string, dateTo: string) {
  // /youtube 엔드포인트 먼저 시도, 실패시 /all?datasource=youtube 로 fallback
  for (const url of [
    `${BASE}?api_key=${API_KEY}&fields=${DAILY_FIELDS}&date_from=${dateFrom}&date_to=${dateTo}`,
    `${BASE_ALL}?api_key=${API_KEY}&fields=${DAILY_FIELDS}&date_from=${dateFrom}&date_to=${dateTo}&datasource=youtube`,
  ]) {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' })
    const json = await res.json()
    if (!json.error && json.data?.length > 0) return json.data
  }
  return []
}

async function windsorVideos(dateFrom: string, dateTo: string) {
  for (const url of [
    `${BASE}?api_key=${API_KEY}&fields=${VIDEO_FIELDS}&date_from=${dateFrom}&date_to=${dateTo}`,
    `${BASE_ALL}?api_key=${API_KEY}&fields=${VIDEO_FIELDS}&date_from=${dateFrom}&date_to=${dateTo}&datasource=youtube`,
  ]) {
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' })
    const json = await res.json()
    if (!json.error && json.data?.length > 0) return json.data
  }
  return []
}

async function windsorSubscribers() {
  // 1순위: subscribers 필드
  try {
    const url = `${BASE}?api_key=${API_KEY}&fields=date,subscribers`
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' })
    const json = await res.json()
    const val = Number(json.data?.[0]?.subscribers ?? 0)
    if (val > 0) return val
  } catch { /* fallthrough */ }

  // 2순위: subscribers_gained 합산 (유입 구독자 수)
  try {
    const url = `${BASE}?api_key=${API_KEY}&fields=date,subscribers_gained`
    const res = await fetch(url, { headers: HEADERS, cache: 'no-store' })
    const json = await res.json()
    const rows: { subscribers_gained?: number }[] = json.data ?? []
    const total = rows.reduce((sum, r) => sum + Math.abs(Number(r.subscribers_gained ?? 0)), 0)
    if (total > 0) return total
  } catch { /* fallthrough */ }

  return null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('date_from') ?? daysAgo(29)
  const dateTo = searchParams.get('date_to') ?? today()
  const compare = searchParams.get('compare') ?? 'month'

  const prevFrom = compare === 'week' ? shiftDays(dateFrom, -7) : prevMonth(dateFrom)
  const prevTo = compare === 'week' ? shiftDays(dateTo, -7) : prevMonth(dateTo)

  try {
    const [curRows, prevRows, videoRows, currentFollowers] = await Promise.all([
      windsorDaily(dateFrom, dateTo),
      windsorDaily(prevFrom, prevTo),
      windsorVideos(dateFrom, dateTo),
      windsorSubscribers(),
    ])

    const data = parseDailyRows(curRows)
    const prevData = parseDailyRows(prevRows)
    const videos = parseVideoRows(videoRows)

    console.log('[YT API] rows:', curRows.length, 'daily:', data.length, 'videos:', videos.length)

    return NextResponse.json({ data, posts: [], prevData, currentFollowers, videos })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '연결 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10)
}
