'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TopPost } from '@/lib/types'
import { analyzePost } from '@/lib/stats'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Trophy, Film, Images, ImageIcon } from 'lucide-react'

interface Props {
  posts: TopPost[]
}

const MEDAL = ['🥇', '🥈', '🥉', '4위', '5위']
const TYPE_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  REELS: { label: '릴스', icon: Film, color: 'text-purple-500' },
  CAROUSEL_ALBUM: { label: '캐러셀', icon: Images, color: 'text-blue-500' },
  IMAGE: { label: '이미지', icon: ImageIcon, color: 'text-green-500' },
}

function Thumbnail({ url, type }: { url: string; type: string }) {
  return (
    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 shrink-0">
      {type === 'REELS' ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 gap-1">
          <Film size={22} className="text-white opacity-80" />
          <span className="text-white text-xs opacity-60">릴스</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="post thumbnail" className="w-full h-full object-cover" loading="lazy" />
      )}
    </div>
  )
}

export function TopPostsCard({ posts }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Trophy size={15} className="text-amber-500" />
          고성과 콘텐츠 TOP {posts.length}
        </CardTitle>
        <p className="text-xs text-muted-foreground">인게이지먼트 기준 · 팔로워 유입수는 Windsor.ai 미지원</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post, i) => {
            const typeInfo = TYPE_INFO[post.mediaType] ?? TYPE_INFO['IMAGE']
            const Icon = typeInfo.icon
            const analysis = analyzePost(post)
            return (
              <div key={post.date} className="rounded-xl border p-4 space-y-3">
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <Thumbnail url={post.mediaUrl} type={post.mediaType} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{MEDAL[i]}</span>
                      <span className="font-semibold text-sm">{format(new Date(post.date), 'M월 d일 (EEE)', { locale: ko })}</span>
                      <span className={`flex items-center gap-1 text-xs ${typeInfo.color}`}>
                        <Icon size={11} />{typeInfo.label}
                      </span>
                    </div>
                    {/* Metrics grid */}
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">도달수</p>
                        <p className="text-sm font-semibold">{post.reach >= 1000 ? `${(post.reach / 1000).toFixed(1)}k` : post.reach || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">총 반응</p>
                        <p className="text-sm font-semibold">{post.engagement > 0 ? post.engagement.toLocaleString() : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">반응율</p>
                        <p className="text-sm font-bold text-pink-600">{post.engagementRate > 0 ? `${post.engagementRate.toFixed(2)}%` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">좋아요</p>
                        <p className="text-sm font-medium text-amber-600">{post.likes || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">댓글</p>
                        <p className="text-sm font-medium text-emerald-600">{post.comments || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">공유 / 저장</p>
                        <p className="text-sm font-medium text-indigo-600">{post.shares} / <span className="text-pink-600">{post.saves}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Analysis line */}
                <div className="rounded-md bg-amber-50 border border-amber-100 px-3 py-2 text-xs text-amber-800 leading-relaxed">
                  💡 {analysis}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
