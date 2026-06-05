'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PostItem } from '@/lib/types'
import { calcEngagement, calcEngagementRate } from '@/lib/stats'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Film, Images, ImageIcon } from 'lucide-react'

interface Props {
  posts: PostItem[]
}

const TYPE_LABEL: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  REELS: { label: '릴스', icon: Film, color: 'text-purple-500' },
  CAROUSEL_ALBUM: { label: '캐러셀', icon: Images, color: 'text-blue-500' },
  IMAGE: { label: '이미지', icon: ImageIcon, color: 'text-green-500' },
}

function Thumbnail({ url, type }: { url: string; type: string }) {
  const isVideo = type === 'REELS'
  return (
    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
      {isVideo ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-800">
          <Film size={20} className="text-white opacity-70" />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="post" className="w-full h-full object-cover" loading="lazy" />
      )}
    </div>
  )
}

export function ContentList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">업로드 콘텐츠</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">이 기간 업로드된 콘텐츠가 없습니다.</p></CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">업로드 콘텐츠 ({posts.length}개)</CardTitle>
        <p className="text-xs text-muted-foreground">도달 데이터는 해당 일자 채널 전체 집계 기준입니다</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map((post) => {
            const eng = calcEngagement(post)
            const rate = calcEngagementRate(post)
            const typeInfo = TYPE_LABEL[post.mediaType] ?? TYPE_LABEL['IMAGE']
            const Icon = typeInfo.icon
            return (
              <div key={`${post.date}-${post.mediaUrl}`} className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                <Thumbnail url={post.mediaUrl} type={post.mediaType} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{format(new Date(post.date), 'M월 d일 (EEE)', { locale: ko })}</span>
                    <span className={`flex items-center gap-1 text-xs ${typeInfo.color}`}>
                      <Icon size={11} />
                      {typeInfo.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>도달 <strong className="text-foreground">{post.reach >= 1000 ? `${(post.reach / 1000).toFixed(1)}k` : post.reach || '—'}</strong></span>
                    <span>좋아요 <strong className="text-amber-600">{post.likes || '—'}</strong></span>
                    <span>댓글 <strong className="text-emerald-600">{post.comments || '—'}</strong></span>
                    <span>공유 <strong className="text-indigo-600">{post.shares || '—'}</strong></span>
                    <span>저장 <strong className="text-pink-600">{post.saves || '—'}</strong></span>
                    <span>반응율 <strong className="text-foreground">{rate > 0 ? `${rate.toFixed(2)}%` : '—'}</strong></span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">총 반응</p>
                  <p className="text-sm font-bold">{eng > 0 ? eng.toLocaleString() : '—'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
