export interface DailyMetric {
  date: string
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
}

export interface PostItem {
  date: string
  mediaUrl: string
  mediaType: string
  caption: string
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
