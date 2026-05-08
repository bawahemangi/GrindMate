import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { groupsApi } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Flame, Trophy, Medal } from 'lucide-react'
import clsx from 'clsx'

const RANK_STYLE = [
  'text-yellow-400 bg-yellow-400/10',
  'text-slate-300 bg-slate-300/10',
  'text-amber-600 bg-amber-600/10',
]
const RANK_ICON = [
  <Trophy size={14} />,
  <Medal size={14} />,
  <Medal size={14} />,
]

export default function LeaderboardPage() {
  const { id } = useParams()
  const { user } = useAuth()

  const { data: group } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.get(id).then(r => r.data),
  })

  const { data: board = [], isLoading } = useQuery({
    queryKey: ['leaderboard', id],
    queryFn: () => groupsApi.leaderboard(id).then(r => r.data),
  })

  return (
    <div className="p-8 animate-fade-in max-w-2xl">
      <Link to={`/group/${id}`} className="flex items-center gap-2 text-ink-muted hover:text-ink-base text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to {group?.name}
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Trophy size={20} className="text-yellow-400" />
        <h1 className="font-display font-bold text-2xl text-ink-bright">Leaderboard</h1>
      </div>
      <p className="text-ink-muted text-sm mb-8">This month's rankings</p>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 bg-surface-1 border border-surface-3 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {board.map((entry, i) => {
            const isMe = entry.user.id === user?.id
            const rankStyle = RANK_STYLE[i] || 'text-ink-muted bg-surface-3'
            const rankIcon = RANK_ICON[i]

            return (
              <div
                key={entry.user.id}
                className={clsx(
                  'card p-5 flex items-center gap-4 transition-all',
                  isMe && 'border-brand-500/40 bg-brand-500/5'
                )}
              >
                {/* Rank */}
                <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center font-display font-bold text-sm flex-shrink-0', rankStyle)}>
                  {rankIcon || `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-surface-3 flex items-center justify-center font-display font-bold text-ink-bright">
                  {entry.user.username[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-semibold text-ink-bright">{entry.user.username}</span>
                    {isMe && <span className="badge bg-brand-500/10 text-brand-400 text-[10px]">you</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-ink-muted">
                      Today: <span className="text-ink-base font-medium">{entry.completions_today}</span>
                    </span>
                    <span className="text-xs text-ink-muted">
                      Month: <span className="text-ink-base font-medium">{entry.completions_month}</span>
                    </span>
                  </div>
                </div>

                {/* Streak */}
                <div className="flex items-center gap-1 bg-brand-500/10 px-2.5 py-1 rounded-full">
                  <Flame size={13} className="text-brand-400" />
                  <span className="font-mono font-bold text-brand-400 text-sm">{entry.streak}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
