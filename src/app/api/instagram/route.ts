import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.WINDSOR_API_KEY
const BASE = 'https://connectors.windsor.ai/instagram'
const FIELDS = 'date,account_name,reach,likes,comments,shares,saves,media_url,media_type,followers_count'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateFrom = searchParams.get('date_from') ?? daysAgo(29)
  const dateTo = searchParams.get('date_to') ?? today()

  try {
    const [curRes, prevRes, followerRes] = await Promise.all([
      fetch(`${BASE}?api_key=${API_KEY}&fields=${FIELDS}&date_from=${dateFrom}&date_to=${dateTo}`, { next: { revalidate: 3600 } }),
      fetch(`${BASE}?api_key=${API_KEY}&fields=${FIELDS}&date_from=${prevMonth(dateFrom)}&date_to=${prevMonth(dateTo)}`, { next: { revalidate: 3600 } }),
      fetch(`${BASE}?api_key=${API_KEY}&fields=date,account_name,followers_count`, { next: { revalidate: 3600 } }),
    ])

    const [curJson, prevJson, followerJson] = await Promise.all([curRes.json(), prevRes.json(), followerRes.json()])
    if (curJson.error) return NextResponse.json({ error: curJson.error }, { status: 400 })

    const { daily: data, posts } = parseRows(curJson.data ?? [])
    const { daily: prevData } = parseRows(prevJson.data ?? [])
    const currentFollowers = followerJson.data?.[0]?.followers_count ?? null

    return NextResponse.json({ data, posts, prevData, currentFollowers })
  } catch {
    return NextResponse.json({ error: 'Windsor.ai 연결 실패' }, { status: 500 })
  }
}

type RawRow = {
  date: string
  account_name: string
  reach: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  media_url: string | null
  media_type: string | null
}

function parseRows(rows: RawRow[]) {
  // Rows with media_url = post metadata; rows with reach = daily aggregates
  const postRows = rows.filter((r) => r.media_url)
  const dailyRows = rows.filter((r) => !r.media_url && r.reach != null)

  // Build daily metric map
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

  // Deduplicate posts: one thumbnail per date (prefer IMAGE/CAROUSEL over REELS for display)
  const postByDate = new Map<string, { date: string; mediaUrl: string; mediaType: string }>()
  for (const r of postRows) {
    const existing = postByDate.get(r.date)
    if (!existing || r.media_type === 'IMAGE' || r.media_type === 'CAROUSEL_ALBUM') {
      postByDate.set(r.date, {
        date: r.date,
        mediaUrl: r.media_url!,
        mediaType: r.media_type ?? 'IMAGE',
      })
    }
  }

  // Build posts with metrics from the same day's aggregate
  const posts = Array.from(postByDate.values()).map((p) => {
    const m = dailyMap.get(p.date) ?? { reach: 0, likes: 0, comments: 0, shares: 0, saves: 0 }
    return { ...p, ...m }
  }).sort((a, b) => a.date.localeCompare(b.date))

  const daily = Array.from(dailyMap.entries())
    .map(([date, m]) => ({ date, ...m }))
    .sort((a, b) => a.date.localeCompare(b.date))

  return { daily, posts }
}

/** Shift date back by 1 calendar month */
function prevMonth(dateStr: string): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
}

function today() { return new Date().toISOString().slice(0, 10) }
function daysAgo(n: number) {
  const d = new Date(); d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
