'use client'

import { PostItem } from '@/lib/types'
import { calcEngagement, calcEngagementRate } from '@/lib/stats'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Film, Images, ImageIcon, Trophy } from 'lucide-react'

interface Props { posts: PostItem[]; topN?: number }

const TYPE_INFO: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  REELS: { label: '릴스', icon: Film, color: '#A78BFA' },
  CAROUSEL_ALBUM: { label: '캐러셀', icon: Images, color: '#60A5FA' },
  IMAGE: { label: '이미지', icon: ImageIcon, color: '#34D399' },
}

export function DarkContentList({ posts, topN }: Props) {
  const sorted = topN
    ? [...posts].sort((a, b) => calcEngagement(b) - calcEngagement(a)).slice(0, topN)
    : posts

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        {topN && <Trophy size={14} className="text-amber-400" />}
        <p className="text-xs text-white/50 uppercase tracking-wide font-medium">
          {topN ? `고성과 콘텐츠 TOP ${topN}` : `업로드 콘텐츠 (${posts.length}개)`}
        </p>
      </div>
      <div className="space-y-3">
        {sorted.map((post, i) => {
          const eng = calcEngagement(post)
          const rate = calcEngagementRate(post)
          const info = TYPE_INFO[post.mediaType] ?? TYPE_INFO['IMAGE']
          const Icon = info.icon
          return (
            <div key={`${post.date}-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/4 hover:bg-white/8 transition-colors">
              {/* Thumbnail */}
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-white/10 shrink-0">
                {post.mediaType === 'REELS' ? (
                  <div className="w-full h-full flex items-center justify-center bg-purple-900/50">
                    <Film size={18} className="text-purple-300" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" loading="lazy" />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {topN && <span className="text-sm">{['🥇','🥈','🥉','4','5'][i]}</span>}
                  <span className="text-sm font-medium text-white">{format(new Date(post.date), 'M월 d일 (EEE)', { locale: ko })}</span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: info.color }}>
                    <Icon size={10} />{info.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/50">
                  <span>도달 <span className="text-white/80">{post.reach >= 1000 ? `${(post.reach/1000).toFixed(1)}k` : post.reach || '—'}</span></span>
                  <span>좋아요 <span className="text-amber-400">{post.likes || '—'}</span></span>
                  <span>댓글 <span className="text-emerald-400">{post.comments || '—'}</span></span>
                  <span>공유 <span className="text-purple-400">{post.shares || '—'}</span></span>
                  <span>저장 <span className="text-pink-400">{post.saves || '—'}</span></span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-white/30">반응율</p>
                <p className="text-sm font-bold text-pink-400">{rate > 0 ? `${rate.toFixed(2)}%` : '—'}</p>
                <p className="text-xs text-white/50 mt-0.5">{eng > 0 ? eng.toLocaleString() : '—'}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
