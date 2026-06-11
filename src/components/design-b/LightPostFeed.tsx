'use client'

import { PostItem } from '@/lib/types'
import { calcEngagement, calcEngagementRate, getTopPosts, analyzePost } from '@/lib/stats'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Film, Images, ImageIcon, Trophy, Zap } from 'lucide-react'
import { useState } from 'react'

const TYPE_INFO: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  REELS: { label: '릴스', icon: Film, bg: '#EDE9FE', text: '#7C3AED' },
  CAROUSEL_ALBUM: { label: '캐러셀', icon: Images, bg: '#DBEAFE', text: '#1D4ED8' },
  IMAGE: { label: '이미지', icon: ImageIcon, bg: '#D1FAE5', text: '#065F46' },
}

const RANK_EMOJI = ['🥇', '🥈', '🥉', '4위', '5위']

function Thumbnail({ post }: { post: PostItem }) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 gap-1">
        <Film size={20} className="text-purple-400" />
        <span className="text-[10px] text-purple-500 font-medium">릴스</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.mediaUrl}
      alt="post"
      className="w-full h-full object-cover"
      loading="lazy"
      onError={() => setImgError(true)}
    />
  )
}

function PostCard({ post, rank, insight }: { post: PostItem; rank?: number; insight?: string }) {
  const eng = calcEngagement(post)
  const rate = calcEngagementRate(post)
  const info = TYPE_INFO[post.mediaType] ?? TYPE_INFO['IMAGE']
  const Icon = info.icon

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <Thumbnail post={post} />
        {rank !== undefined && (
          <div className="absolute top-1.5 left-1.5 bg-white/90 backdrop-blur-sm rounded-lg px-1.5 py-0.5 shadow-sm leading-none">
            <span className="text-lg">{RANK_EMOJI[rank]}</span>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium flex items-center gap-0.5" style={{ background: info.bg, color: info.text }}>
          <Icon size={9} />{info.label}
        </div>
      </div>
      {/* Metrics */}
      <div className="p-2">
        <p className="text-[10px] font-semibold text-gray-600 mb-1.5">{format(new Date(post.date), 'M월 d일 (EEE)', { locale: ko })}</p>
        <div className="grid grid-cols-3 gap-0.5 text-center mb-1.5">
          <div>
            <p className="text-[9px] text-gray-400">도달</p>
            <p className="text-xs font-bold text-gray-800">{post.reach >= 1000 ? `${(post.reach/1000).toFixed(1)}k` : post.reach || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400">반응</p>
            <p className="text-xs font-bold text-indigo-600">{eng > 0 ? eng : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-gray-400">반응율</p>
            <p className="text-xs font-bold text-pink-600">{rate > 0 ? `${rate.toFixed(1)}%` : '—'}</p>
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-gray-400 pt-1.5 border-t border-gray-50">
          <span>❤️{post.likes || 0}</span>
          <span>💬{post.comments || 0}</span>
          <span>↗️{post.shares || 0}</span>
          <span>🔖{post.saves || 0}</span>
        </div>
        {insight && (
          <p className="mt-1.5 pt-1.5 border-t border-indigo-50 text-[9px] text-indigo-600 leading-relaxed">{insight}</p>
        )}
      </div>
    </div>
  )
}

export function LightPostFeed({ posts }: { posts: PostItem[] }) {
  const sortedPosts = [...posts].sort((a, b) => b.date.localeCompare(a.date))
  const topPosts = getTopPosts(posts, 5)

  return (
    <div className="space-y-6">
      {/* All uploads — 최신순 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} className="text-indigo-500" />
          <p className="text-sm font-semibold text-gray-800">업로드 콘텐츠 ({sortedPosts.length}개)</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {sortedPosts.map((p, i) => <PostCard key={`${p.date}-${i}`} post={p} />)}
        </div>
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={15} className="text-amber-500" />
            <p className="text-sm font-semibold text-gray-800">고성과 콘텐츠 TOP {topPosts.length}</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {topPosts.map((p, i) => (
              <PostCard
                key={`top-${p.date}-${i}`}
                post={p}
                rank={i}
                insight={analyzePost(p)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
