'use client'

import { PostItem } from '@/lib/types'
import { calcEngagement, calcEngagementRate, getTopPosts } from '@/lib/stats'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Film, Images, ImageIcon, Trophy, Zap } from 'lucide-react'

const TYPE_INFO: Record<string, { label: string; icon: React.ElementType; bg: string; text: string }> = {
  REELS: { label: '릴스', icon: Film, bg: '#EDE9FE', text: '#7C3AED' },
  CAROUSEL_ALBUM: { label: '캐러셀', icon: Images, bg: '#DBEAFE', text: '#1D4ED8' },
  IMAGE: { label: '이미지', icon: ImageIcon, bg: '#D1FAE5', text: '#065F46' },
}

function PostCard({ post, rank }: { post: PostItem; rank?: number }) {
  const eng = calcEngagement(post)
  const rate = calcEngagementRate(post)
  const info = TYPE_INFO[post.mediaType] ?? TYPE_INFO['IMAGE']
  const Icon = info.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100">
        {post.mediaType === 'REELS' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 gap-2">
            <Film size={28} className="text-purple-400" />
            <span className="text-xs text-purple-500 font-medium">릴스</span>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.mediaUrl} alt="post" className="w-full h-full object-cover" loading="lazy" />
        )}
        {rank !== undefined && (
          <div className="absolute top-2 left-2 bg-white rounded-lg px-2 py-0.5 text-xs font-bold shadow-sm">
            {['🥇','🥈','🥉','4위','5위'][rank]}
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-lg px-2 py-0.5 text-xs font-medium flex items-center gap-1" style={{ background: info.bg, color: info.text }}>
          <Icon size={10} />{info.label}
        </div>
      </div>
      {/* Metrics */}
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">{format(new Date(post.date), 'M월 d일 (EEE)', { locale: ko })}</p>
        <div className="grid grid-cols-3 gap-1 text-center">
          <div>
            <p className="text-xs text-gray-400">도달</p>
            <p className="text-sm font-bold text-gray-800">{post.reach >= 1000 ? `${(post.reach/1000).toFixed(1)}k` : post.reach || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">반응</p>
            <p className="text-sm font-bold text-indigo-600">{eng > 0 ? eng : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">반응율</p>
            <p className="text-sm font-bold text-pink-600">{rate > 0 ? `${rate.toFixed(1)}%` : '—'}</p>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">
          <span>❤️ {post.likes || 0}</span>
          <span>💬 {post.comments || 0}</span>
          <span>↗️ {post.shares || 0}</span>
          <span>🔖 {post.saves || 0}</span>
        </div>
      </div>
    </div>
  )
}

export function LightPostFeed({ posts }: { posts: PostItem[] }) {
  const topPosts = getTopPosts(posts, 5)
  return (
    <div className="space-y-6">
      {/* All uploads */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={15} className="text-indigo-500" />
          <p className="text-sm font-semibold text-gray-800">업로드 콘텐츠 ({posts.length}개)</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {posts.map((p, i) => <PostCard key={`${p.date}-${i}`} post={p} />)}
        </div>
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={15} className="text-amber-500" />
            <p className="text-sm font-semibold text-gray-800">고성과 콘텐츠 TOP {topPosts.length}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topPosts.map((p, i) => <PostCard key={`top-${p.date}-${i}`} post={p} rank={i} />)}
          </div>
        </div>
      )}
    </div>
  )
}
