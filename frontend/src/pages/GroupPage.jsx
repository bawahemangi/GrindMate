import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi, tasksApi, notificationsApi } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import TaskCard from '../components/TaskCard'
import AddTaskModal from '../components/AddTaskModal'
import { useState } from 'react'
import { Copy, Trophy, Plus, Users, MessageCircle, Zap, CheckCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import StatsRing from '../components/StatsRing'

export default function GroupPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showAddTask, setShowAddTask] = useState(false)

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.get(id).then(r => r.data),
  })

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.list({ group: id }).then(r => r.data.results || r.data),
  })

  const { data: stats } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => tasksApi.todayStats({ group: id }).then(r => r.data),
  })

  const testWA = useMutation({
    mutationFn: () => notificationsApi.testWhatsapp(),
    onSuccess: () => toast.success('WhatsApp test sent!'),
    onError: () => toast.error('Failed — check your phone number in profile'),
  })

  const copyInvite = () => {
    const url = `${window.location.origin}/join/${group.invite_code}`
    navigator.clipboard.writeText(url)
    toast.success('Invite link copied!')
  }

  const isAdmin = group?.admin?.id === user?.id

  if (groupLoading) return <LoadingSkeleton />

  const dailyTasks = tasks.filter(t => t.frequency === 'daily')
  const weeklyTasks = tasks.filter(t => t.frequency === 'weekly')
  const onceTasks = tasks.filter(t => t.frequency === 'once')

  return (
    <div className="p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-400 font-display font-bold text-lg">
              {group?.name[0]?.toUpperCase()}
            </div>
            <h1 className="font-display font-bold text-2xl text-ink-bright">{group?.name}</h1>
          </div>
          {group?.description && (
            <p className="text-ink-muted text-sm ml-12">{group.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => testWA.mutate()}
            disabled={testWA.isPending}
            className="btn-ghost flex items-center gap-2 text-sm"
            title="Test WhatsApp reminder"
          >
            <MessageCircle size={15} className="text-green-400" />
            Test WA
          </button>
          <button onClick={copyInvite} className="btn-ghost flex items-center gap-2 text-sm">
            <Copy size={15} />
            Invite
          </button>
          <Link to={`/group/${id}/leaderboard`} className="btn-ghost flex items-center gap-2 text-sm">
            <Trophy size={15} className="text-yellow-400" />
            Leaderboard
          </Link>
          <button onClick={() => setShowAddTask(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={15} />
            Add Task
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Stats sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="card p-5 flex flex-col items-center">
            <p className="text-xs font-mono text-ink-muted uppercase tracking-widest mb-3 w-full">Today</p>
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

          {/* Members */}
          <div className="card p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Users size={13} className="text-ink-muted" />
              <span className="text-xs font-mono text-ink-muted uppercase tracking-widest">Members</span>
            </div>
            <div className="space-y-2">
              {group?.members?.map(m => (
                <div key={m.id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-surface-3 flex items-center justify-center text-xs font-display font-bold text-ink-subtle">
                    {m.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-ink-base font-medium">{m.username}</div>
                    <div className="text-xs text-ink-muted flex items-center gap-1">
                      🔥 {m.current_streak} days
                    </div>
                  </div>
                  {m.id === group?.admin?.id && (
                    <span className="ml-auto badge bg-brand-500/10 text-brand-400 text-[10px]">admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Invite code */}
          <div className="card p-4">
            <p className="text-xs font-mono text-ink-muted mb-2">INVITE CODE</p>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-brand-400 text-lg tracking-widest">{group?.invite_code}</span>
              <button onClick={copyInvite} className="text-ink-muted hover:text-brand-400 transition-colors">
                <Copy size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Task lists */}
        <div className="col-span-3 space-y-6">
          <TaskSection title="Daily Tasks" tasks={dailyTasks} groupId={id} loading={tasksLoading} icon={<Zap size={14} className="text-brand-400" />} />
          {weeklyTasks.length > 0 && (
            <TaskSection title="Weekly Tasks" tasks={weeklyTasks} groupId={id} loading={tasksLoading} icon={<CheckCheck size={14} className="text-blue-400" />} />
          )}
          {onceTasks.length > 0 && (
            <TaskSection title="One-Time Tasks" tasks={onceTasks} groupId={id} loading={tasksLoading} icon={<CheckCheck size={14} className="text-purple-400" />} />
          )}
        </div>
      </div>

      {showAddTask && <AddTaskModal groupId={parseInt(id)} members={group?.members || []} onClose={() => setShowAddTask(false)} />}
    </div>
  )
}

function TaskSection({ title, tasks, groupId, loading, icon }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="font-display font-semibold text-ink-bright text-sm">{title}</h2>
        <span className="badge bg-surface-3 text-ink-muted">{tasks.length}</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-surface-1 border border-surface-3 rounded-2xl animate-pulse" />)}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card p-5 text-center text-ink-muted text-sm">No tasks here yet.</div>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => <TaskCard key={t.id} task={t} groupId={groupId} />)}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-20 bg-surface-1 border border-surface-3 rounded-2xl animate-pulse" />)}
    </div>
  )
}
