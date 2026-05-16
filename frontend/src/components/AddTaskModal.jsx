import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/client'
import { X, Plus, User, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'dsa', label: '💻 DSA Problems' },
  { value: 'course', label: '📚 Course / Lectures' },
  { value: 'project', label: '📁 Project Work' },
  { value: 'revision', label: '🧠 Revision' },
  { value: 'mock', label: '🔥 Mock Interview' },
  { value: 'other', label: '📌 Other' },
]

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'once', label: 'One Time' },
]

// groupId = null means personal goal mode
// members = list of group members for assignment (only when groupId is set)
export default function AddTaskModal({ groupId = null, members = [], onClose }) {
  const qc = useQueryClient()
  const isPersonalMode = !groupId

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'dsa',
    frequency: 'daily',
    target_count: 1,
    is_default: !isPersonalMode,
    group: groupId || null,
    assigned_to: isPersonalMode ? 'self' : '',  // 'self' = current user personal goal
  })

  const mutation = useMutation({
    mutationFn: (data) => tasksApi.create(data),
    onSuccess: () => {
      // Invalidate relevant query caches
      if (groupId) qc.invalidateQueries({ queryKey: ['tasks', String(groupId)] })
      qc.invalidateQueries({ queryKey: ['personal-tasks'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      toast.success(isPersonalMode ? 'Personal goal added! 🎯' : 'Task added!')
      onClose()
    },
    onError: () => toast.error('Failed to add task'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    const payload = { ...form }
    // 'self' means no assigned_to (user creates it for themselves personally)
    if (payload.assigned_to === 'self' || payload.assigned_to === '') {
      payload.assigned_to = null
    } else {
      payload.assigned_to = parseInt(payload.assigned_to)
    }
    if (isPersonalMode) {
      payload.group = null
      payload.is_default = false
    }
    mutation.mutate(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 ${isPersonalMode ? 'bg-purple-500/10' : 'bg-brand-500/10'} rounded-lg flex items-center justify-center`}>
              {isPersonalMode
                ? <User size={16} className="text-purple-400" />
                : <Plus size={16} className="text-brand-400" />}
            </div>
            <h2 className="font-display font-bold text-ink-bright">
              {isPersonalMode ? 'Add Personal Goal' : 'Add Task'}
            </h2>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-base">
            <X size={18} />
          </button>
        </div>

        {isPersonalMode && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
            <User size={12} />
            This goal is private to you and won't appear in any group.
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder={isPersonalMode ? 'e.g. Read 20 pages' : 'e.g. 2 LeetCode problems'}
              value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div>
            <label className="label">Description <span className="text-ink-muted">(optional)</span></label>
            <input className="input" placeholder="Any extra context..." value={form.description}
              onChange={e => set('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input text-sm" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Frequency</label>
              <select className="input text-sm" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
                {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Target Count <span className="text-ink-muted">(e.g. 2 for "2 problems")</span></label>
            <input type="number" min={1} max={100} className="input" value={form.target_count}
              onChange={e => set('target_count', parseInt(e.target.value) || 1)} />
          </div>

          {/* Assign to member — only in group mode */}
          {!isPersonalMode && members.length > 0 && (
            <div>
              <label className="label flex items-center gap-1">
                <Users size={12} className="text-ink-muted" /> Assign To
              </label>
              <select className="input text-sm" value={form.assigned_to}
                onChange={e => set('assigned_to', e.target.value)}>
                <option value="">Everyone in group</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>@{m.username}</option>
                ))}
              </select>
              <p className="text-xs text-ink-muted mt-1">Leave as "Everyone" to make this a group-wide task.</p>
            </div>
          )}

          {/* is_default only for group-wide (unassigned) tasks */}
          {!isPersonalMode && !form.assigned_to && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-orange-500" checked={form.is_default}
                onChange={e => set('is_default', e.target.checked)} />
              <span className="text-sm text-ink-base">Set as default daily task for all members</span>
            </label>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={!form.title.trim() || mutation.isPending}
            className={`flex-1 ${isPersonalMode ? 'bg-purple-600 hover:bg-purple-500 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors' : 'btn-primary'}`}
          >
            {mutation.isPending ? 'Adding...' : isPersonalMode ? 'Add Goal' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
