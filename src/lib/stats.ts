import { DailyMetric, PostItem, TopPost, Insight } from './types'

export function calcEngagement(d: Pick<DailyMetric, 'likes' | 'comments' | 'shares' | 'saves'>) {
  return d.likes + d.comments + d.shares + d.saves
}

export function calcEngagementRate(d: Pick<DailyMetric, 'reach' | 'likes' | 'comments' | 'shares' | 'saves'>) {
  const eng = calcEngagement(d)
  return d.reach > 0 ? (eng / d.reach) * 100 : 0
}

export function pctChange(current: number, prev: number): number {
  if (prev === 0) return 0
  return ((current - prev) / prev) * 100
}

export function sumField(arr: DailyMetric[], key: keyof DailyMetric): number {
  return arr.reduce((acc, row) => acc + (Number(row[key]) || 0), 0)
}

/** 도달 급등일 감지 (평균 1.4배 이상) — 차트 마커용 */
export function detectUploadDays(data: DailyMetric[]): string[] {
  if (data.length < 3) return []
  const avg = data.reduce((a, d) => a + d.reach, 0) / data.length
  return data.filter((d) => d.reach >= avg * 1.4).map((d) => d.date)
}

export function getTopPosts(posts: PostItem[], n = 5): TopPost[] {
  return [...posts]
    .map((p) => ({
      ...p,
      engagement: calcEngagement(p),
      engagementRate: calcEngagementRate(p),
    }))
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, n)
}

export function analyzePost(post: TopPost): string {
  const eng = post.engagement
  const rate = post.engagementRate

  const parts: string[] = []

  if (post.mediaType === 'REELS') parts.push('릴스 형식으로 알고리즘 노출 극대화')
  else if (post.mediaType === 'CAROUSEL_ALBUM') parts.push('캐러셀 형식으로 체류시간 증가')

  const saveRatio = eng > 0 ? post.saves / eng : 0
  const shareRatio = eng > 0 ? post.shares / eng : 0
  const commentRatio = eng > 0 ? post.comments / eng : 0

  if (saveRatio >= 0.3) parts.push('저장율 높음 → 정보성·유용성 콘텐츠 선호')
  if (shareRatio >= 0.2) parts.push('공유 활발 → 바이럴 확산 효과 발생')
  if (commentRatio >= 0.1) parts.push('댓글 다수 → 커뮤니티 참여 유도 성공')

  if (rate >= 5) parts.push(`반응율 ${rate.toFixed(1)}%로 우수한 팔로워 반응`)
  else if (post.reach >= 100000) parts.push(`도달 ${(post.reach / 1000).toFixed(0)}k로 광범위한 신규 노출 달성`)

  return parts.length > 0 ? parts.join(' · ') : '이 기간 인게이지먼트 상위 콘텐츠'
}

export function generateInsights(data: DailyMetric[]): Insight[] {
  const insights: Insight[] = []
  if (data.length < 7) return insights

  const half = Math.floor(data.length / 2)
  const first = data.slice(0, half)
  const second = data.slice(half)

  const firstAvgReach = sumField(first, 'reach') / first.length
  const secondAvgReach = sumField(second, 'reach') / second.length
  const reachChange = pctChange(secondAvgReach, firstAvgReach)

  if (reachChange >= 15) {
    insights.push({
      type: 'up',
      title: `도달수 ${reachChange.toFixed(0)}% 상승`,
      body: `기간 후반 평균 도달 ${secondAvgReach.toLocaleString('ko-KR', { maximumFractionDigits: 0 })} — 알고리즘 노출 확대 또는 콘텐츠 바이럴 효과로 추정됩니다.`,
    })
  } else if (reachChange <= -15) {
    insights.push({
      type: 'down',
      title: `도달수 ${Math.abs(reachChange).toFixed(0)}% 하락`,
      body: `기간 후반 평균 도달 ${secondAvgReach.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}으로 감소했습니다. 게시 빈도 조정 또는 콘텐츠 포맷 변화가 필요합니다.`,
    })
  }

  const firstEngRates = first.map(calcEngagementRate)
  const secondEngRates = second.map(calcEngagementRate)
  const firstAvgEng = firstEngRates.reduce((a, b) => a + b, 0) / firstEngRates.length
  const secondAvgEng = secondEngRates.reduce((a, b) => a + b, 0) / secondEngRates.length
  const engChange = pctChange(secondAvgEng, firstAvgEng)

  if (engChange >= 20) {
    insights.push({ type: 'up', title: `반응율 ${engChange.toFixed(0)}% 개선`, body: '팔로워 반응이 기간 후반 크게 향상됐습니다. 콘텐츠 주제·포맷이 타겟과 잘 맞았던 것으로 보입니다.' })
  } else if (engChange <= -20) {
    insights.push({ type: 'down', title: `반응율 ${Math.abs(engChange).toFixed(0)}% 저하`, body: 'CTA 강화 및 팔로워 공감 콘텐츠 보강이 필요합니다.' })
  }

  // 최적 요일
  const dayMap: Record<number, number[]> = {}
  data.forEach((d) => {
    const day = new Date(d.date).getDay()
    if (!dayMap[day]) dayMap[day] = []
    dayMap[day].push(calcEngagementRate(d))
  })
  const dayAvgs = Object.entries(dayMap)
    .map(([day, rates]) => ({ day: Number(day), avg: rates.reduce((a, b) => a + b, 0) / rates.length }))
    .sort((a, b) => b.avg - a.avg)
  const days = ['일', '월', '화', '수', '목', '금', '토']
  if (dayAvgs.length >= 2) {
    const best = dayAvgs[0]
    const worst = dayAvgs[dayAvgs.length - 1]
    insights.push({
      type: 'tip',
      title: `최적 업로드 요일: ${days[best.day]}요일 (평균 반응율 ${best.avg.toFixed(2)}%)`,
      body: `${days[worst.day]}요일(${worst.avg.toFixed(2)}%)은 반응율이 가장 낮습니다. 핵심 콘텐츠는 ${days[best.day]}요일에 집중 업로드하세요.`,
    })
  }

  const totalEng = sumField(data, 'likes') + sumField(data, 'comments') + sumField(data, 'shares') + sumField(data, 'saves')
  const saveRatio = totalEng > 0 ? (sumField(data, 'saves') / totalEng) * 100 : 0
  const shareRatio = totalEng > 0 ? (sumField(data, 'shares') / totalEng) * 100 : 0

  if (saveRatio >= 20) {
    insights.push({ type: 'tip', title: '저장율 높음 → 정보성 콘텐츠 강화 추천', body: `저장이 전체 반응의 ${saveRatio.toFixed(0)}%입니다. 레시피·팁·정보 정리형 콘텐츠를 늘려 저장 유도를 강화하세요.` })
  }
  if (shareRatio >= 15) {
    insights.push({ type: 'tip', title: '공유율 높음 → 바이럴 콘텐츠 강화 추천', body: `공유가 ${shareRatio.toFixed(0)}%입니다. 공감·유머·챌린지 포맷이 신규 팔로워 유입에 효과적입니다.` })
  }

  insights.push({ type: 'tip', title: '콘텐츠 제안: 고성과 포맷 반복', body: '상위 성과 콘텐츠의 포맷(릴스·캐러셀)·주제·길이 패턴을 분석해 동일 방식으로 제작하세요. 알고리즘이 선호하는 패턴이 존재할 가능성이 높습니다.' })

  return insights
}
