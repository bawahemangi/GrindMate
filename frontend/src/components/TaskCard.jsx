import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/client'
import { CheckCircle2, Circle, Flame, BookOpen, Code2, FolderOpen, Brain, MoreHorizontal, Trash2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const CATEGORY_META = {
  dsa: { icon: Code2, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'DSA' },
  course: { icon: BookOpen, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'Course' },
  project: { icon: FolderOpen, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Project' },
  revision: { icon: Brain, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Revision' },
  mock: { icon: Flame, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Mock' },
  other: { icon: Circle, color: 'text-ink-muted', bg: 'bg-surface-3', label: 'Other' },
}

export default function TaskCard({ task, groupId }) {
  const qc = useQueryClient()
  const [showMenu, setShowMenu] = useState(false)
  const isCompleted = !!task.user_completion_today
  const meta = CATEGORY_META[task.category] || CATEGORY_META.other
  const Icon = meta.icon

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['tasks', groupId] })
    qc.invalidateQueries({ queryKey: ['stats', groupId] })
  }

  const completeMutation = useMutation({
    mutationFn: () => tasksApi.markComplete(task.id),
    onSuccess: () => { toast.success('Task done! 🔥'); invalidate() },
    onError: () => toast.error('Could not mark complete'),
  })

  const uncompleteMutation = useMutation({
    mutationFn: () => tasksApi.unmarkComplete(task.id),
    onSuccess: () => { toast('Unmarked', { icon: '↩️' }); invalidate() },
  })

  const deleteMutation = useMutation({
    mutationFn: () => tasksApi.delete(task.id),
    onSuccess: () => { toast.success('Task deleted'); invalidate() },
  })

  const toggle = () => {
    if (isCompleted) uncompleteMutation.mutate()
    else completeMutation.mutate()
  }

  const loading = completeMutation.isPending || uncompleteMutation.isPending

  return (
    <div className={clsx(
      'card p-4 flex items-start gap-3 group transition-all duration-200',
      isCompleted && 'opacity-70'
    )}>
      {/* Check button */}
      <button
        onClick={toggle}
        disabled={loading}
        className={clsx(
          'mt-0.5 flex-shrink-0 transition-all duration-200',
          isCompleted ? 'text-brand-500 animate-tick' : 'text-ink-muted hover:text-brand-400'
        )}
      >
        {isCompleted
          ? <CheckCircle2 size={22} />
          : <Circle size={22} />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className={clsx(
              'font-display font-semibold text-sm transition-all',
              isCompleted ? 'line-through text-ink-muted' : 'text-ink-bright'
            )}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{task.description}</p>
            )}
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="opacity-0 group-hover:opacity-100 text-ink-muted hover:text-ink-base transition-all p-1"
            >
              <MoreHorizontal size={15} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-6 z-20 bg-surface-2 border border-surface-3 rounded-xl shadow-xl py-1 w-36" onMouseLeave={() => setShowMenu(false)}>
                <button
                  onClick={() => { deleteMutation.mutate(); setShowMenu(false) }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-surface-3 transition-colors"
                >
                  <Trash2 size={13} /> Delete task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2">
          <span className={clsx('badge', meta.bg, meta.color)}>
            <Icon size={10} />
            {meta.label}
          </span>
          {task.target_count > 1 && (
            <span className="badge bg-surface-3 text-ink-muted">
              ×{task.target_count}
            </span>
          )}
          {task.total_completions_today > 0 && (
            <span className="text-xs text-ink-muted font-mono">
              {task.total_completions_today} done
            </span>
          )}
          {task.is_default && (
            <span className="badge bg-brand-500/10 text-brand-400">default</span>
          )}
        </div>
      </div>
    </div>
  )
}
