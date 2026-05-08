import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api/client'
import { X, Plus } from 'lucide-react'
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

export default function AddTaskModal({ groupId, onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    title: '', description: '', category: 'dsa',
    frequency: 'daily', target_count: 1,
    is_default: true, group: groupId,
  })

  const mutation = useMutation({
    mutationFn: (data) => tasksApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks', groupId] })
      toast.success('Task added!')
      onClose()
    },
    onError: () => toast.error('Failed to add task'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center">
              <Plus size={16} className="text-brand-400" />
            </div>
            <h2 className="font-display font-bold text-ink-bright">Add Task</h2>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-base">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="input" placeholder="e.g. 2 LeetCode problems" value={form.title}
              onChange={e => set('title', e.target.value)} />
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

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 accent-orange-500" checked={form.is_default}
              onChange={e => set('is_default', e.target.checked)} />
            <span className="text-sm text-ink-base">Set as default (auto-assigned to all members)</span>
          </label>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={!form.title.trim() || mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
