import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { groupsApi, tasksApi } from '../api/client'
import { X, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateGroupModal({ onClose }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', description: '' })

  const mutation = useMutation({
    mutationFn: async (data) => {
      const res = await groupsApi.create(data)
      // Seed default tasks
      await tasksApi.seedDefaults(res.data.id).catch(() => {})
      return res.data
    },
    onSuccess: (group) => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      toast.success(`"${group.name}" created with default tasks!`)
      onClose()
    },
    onError: () => toast.error('Failed to create group'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-1 border border-surface-3 rounded-2xl p-6 w-full max-w-md mx-4 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500/10 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-brand-400" />
            </div>
            <h2 className="font-display font-bold text-ink-bright">New Group</h2>
          </div>
          <button onClick={onClose} className="text-ink-muted hover:text-ink-base transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Group Name</label>
            <input
              className="input"
              placeholder="e.g. Final Year Grinders"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label">Description <span className="text-ink-muted">(optional)</span></label>
            <textarea
              className="input resize-none h-20"
              placeholder="What's this group about?"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="bg-surface-2 rounded-xl p-3 text-xs text-ink-muted">
            <span className="text-brand-400 font-medium">Default tasks</span> will be auto-added: 2 DSA Problems, Course Lecture, Project Work, Revision.
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={!form.name.trim() || mutation.isPending}
            className="btn-primary flex-1"
          >
            {mutation.isPending ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  )
}
