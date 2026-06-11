import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.WINDSOR_API_KEY ?? process.env.NEXT_PUBLIC_WINDSOR_API_KEY ?? ''
const BASE = 'https://connectors.windsor.ai/instagram'
const FIELDS = 'date,account_name,reach,likes,comments,shares,saves,media_url,media_type,followers_count'

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8',
  'Referer': 'https://windsor.ai/',
  'Origin': 'https://windsor.ai',
}

function prevMonth(dateStr: string): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function shiftDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
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

async function windsor(dateFrom: string, dateTo: string) {
  const url = `${BASE}?api_key=${API_KEY}&fields=${FIELDS}&date_from=${dateFrom}&date_to=${dateTo}`
  const res = await fetch(url, { headers: HEADERS, cache: 'no-store' })
  const json = await res.json()
  if (json.error) throw new Error(json.error)
  return json.data ?? []
}

async function windsorFollowers() {
  const url = `${BASE}?api_key=${API_KEY}&fields=date,account_name,followers_count`
  const res = await fetch(url, { headers: HEADERS, cache: 'no-store' })
  const json = await res.json()
  return json.data?.[0]?.followers_count ?? null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('date_from') ?? daysAgo(29)
  const dateTo = searchParams.get('date_to') ?? today()
  const compare = searchParams.get('compare') ?? 'month' // 'month' | 'week'

  const prevFrom = compare === 'week' ? shiftDays(dateFrom, -7) : prevMonth(dateFrom)
  const prevTo = compare === 'week' ? shiftDays(dateTo, -7) : prevMonth(dateTo)

  try {
    const [curRows, prevRows, currentFollowers] = await Promise.all([
      windsor(dateFrom, dateTo),
      windsor(prevFrom, prevTo),
      windsorFollowers(),
    ])

    const { daily: data, posts } = parseRows(curRows)
    const { daily: prevData } = parseRows(prevRows)

    return NextResponse.json({ data, posts, prevData, currentFollowers })
  } catch (e) {
    const msg = e instanceof Error ? e.message : '연결 실패'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
