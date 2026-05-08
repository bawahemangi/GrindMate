import { useQuery } from '@tanstack/react-query'
import { groupsApi, tasksApi } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowRight, Users, Plus } from 'lucide-react'
import { useState } from 'react'
import StatsRing from '../components/StatsRing'
import TaskCard from '../components/TaskCard'
import CreateGroupModal from '../components/CreateGroupModal'

export default function DashboardPage() {
  const { user } = useAuth()
  const today = format(new Date(), 'EEEE, MMMM d')
  const [showCreate, setShowCreate] = useState(false)

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list().then(r => r.data.results || r.data),
  })

  // Use first group for dashboard overview
  const primaryGroup = groups[0]

  const { data: stats } = useQuery({
    queryKey: ['stats', primaryGroup?.id],
    queryFn: () => tasksApi.todayStats({ group: primaryGroup?.id }).then(r => r.data),
    enabled: !!primaryGroup,
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', primaryGroup?.id],
    queryFn: () => tasksApi.list({ group: primaryGroup?.id, frequency: 'daily' }).then(r => r.data.results || r.data),
    enabled: !!primaryGroup,
  })

  if (groups.length === 0) return <EmptyState onCreateGroup={() => setShowCreate(true)} showCreate={showCreate} onClose={() => setShowCreate(false)} />

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-1">{today}</p>
        <h1 className="font-display font-bold text-3xl text-ink-bright">
          Hey {user?.username} 👋
        </h1>
        <p className="text-ink-subtle mt-1">Here's your grind for today.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Stats */}
        <div className="col-span-1">
          <div className="card p-6 flex flex-col items-center gap-4">
            <h2 className="font-display font-semibold text-ink-base text-sm w-full">Today's Progress</h2>
            {stats ? (
              <StatsRing
                percent={stats.completion_percent}
                completed={stats.completed_tasks}
                total={stats.total_tasks}
                streak={stats.streak}
              />
            ) : (
              <div className="w-36 h-36 rounded-full bg-surface-2 animate-pulse" />
            )}
          </div>

          {/* Groups list */}
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-ink-base text-sm">Your Groups</h2>
              <button onClick={() => setShowCreate(true)} className="text-xs text-brand-400 hover:text-brand-300 font-medium">+ New</button>
            </div>
            <div className="space-y-2">
              {groups.map(g => (
                <Link
                  key={g.id}
                  to={`/group/${g.id}`}
                  className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface-2 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400 font-display font-bold text-xs">
                      {g.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-ink-base font-medium truncate max-w-[110px]">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-ink-muted">{g.member_count} members</span>
                    <ArrowRight size={12} className="text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tasks */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-ink-bright">
              Today's Tasks
              {primaryGroup && <span className="text-ink-muted font-normal text-sm ml-2">— {primaryGroup.name}</span>}
            </h2>
            {primaryGroup && (
              <Link to={`/group/${primaryGroup.id}`} className="text-xs text-brand-400 hover:text-brand-300 font-medium flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="card p-8 text-center text-ink-muted">
              <p className="text-sm">No daily tasks yet for this group.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
                <TaskCard key={task.id} task={task} groupId={primaryGroup?.id} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function EmptyState({ onCreateGroup, showCreate, onClose }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-brand-400" />
        </div>
        <h2 className="font-display font-bold text-2xl text-ink-bright mb-2">No groups yet</h2>
        <p className="text-ink-muted text-sm mb-6">Create a group with your friends and start tracking your daily grind together.</p>
        <button onClick={onCreateGroup} className="btn-primary inline-flex items-center gap-2">
          <Plus size={16} /> Create a Group
        </button>
      </div>
      {showCreate && <CreateGroupModal onClose={onClose} />}
    </div>
  )
}
