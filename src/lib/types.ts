export interface DailyMetric {
  date: string
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  avgViewDuration?: number     // YouTube: 평균 시청 지속 시간(초)
  estimatedRevenue?: number    // YouTube: 예상 수익(USD)
}

export interface YoutubeVideo {
  videoId: string
  title: string
  date: string
  duration: number       // 초 단위
  views: number
  likes: number
  comments: number
  shares: number
  watchMinutes: number
  avgViewDuration: number
  type: 'shorts' | 'longform' // duration <= 180s → shorts
}

export interface PostItem {
  date: string
  mediaUrl: string
  mediaType: string
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
}

export interface TopPost extends PostItem {
  engagement: number
  engagementRate: number
}

export interface Insight {
  type: 'up' | 'down' | 'tip'
  title: string
  body: string
}
