import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { authApi, notificationsApi } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { User, Phone, MessageCircle, Bell, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [form, setForm] = useState({
    username: user?.username || '',
    phone: user?.phone || '',
    whatsapp_enabled: user?.whatsapp_enabled || false,
  })

  const saveMutation = useMutation({
    mutationFn: (data) => authApi.updateMe(data),
    onSuccess: async () => {
      await refreshUser()
      toast.success('Profile saved!')
    },
    onError: () => toast.error('Failed to save'),
  })

  const testWA = useMutation({
    mutationFn: () => notificationsApi.testWhatsapp(),
    onSuccess: () => toast.success('Test WhatsApp sent! Check your phone 📱'),
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="p-8 max-w-xl animate-fade-in">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-surface-2 rounded-xl flex items-center justify-center">
          <User size={18} className="text-ink-subtle" />
        </div>
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-bright">Profile</h1>
          <p className="text-ink-muted text-sm">Manage your account & reminders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatBox label="Streak" value={`${user?.current_streak || 0}🔥`} />
        <StatBox label="Member since" value={new Date(user?.date_joined).getFullYear()} />
        <StatBox label="WhatsApp" value={user?.whatsapp_enabled ? '✅ On' : '❌ Off'} />
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <label className="label">Username</label>
          <input className="input" value={form.username} onChange={e => set('username', e.target.value)} />
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Phone size={13} />
            WhatsApp Number
          </label>
          <input
            className="input"
            placeholder="+919876543210"
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
          />
          <p className="text-xs text-ink-muted mt-1">Include country code (e.g. +91 for India)</p>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-surface-2 rounded-xl">
          <div className="flex items-center gap-2">
            <Bell size={15} className="text-green-400" />
            <div>
              <p className="text-sm font-medium text-ink-base">WhatsApp Reminders</p>
              <p className="text-xs text-ink-muted">Morning (8am), Evening (8pm), Summary (11pm)</p>
            </div>
          </div>
          <button
            onClick={() => set('whatsapp_enabled', !form.whatsapp_enabled)}
            className={`w-11 h-6 rounded-full transition-all ${form.whatsapp_enabled ? 'bg-green-500' : 'bg-surface-4'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${form.whatsapp_enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {form.whatsapp_enabled && (
          <button
            onClick={() => testWA.mutate()}
            disabled={testWA.isPending || !form.phone}
            className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle size={15} className="text-green-400" />
            {testWA.isPending ? 'Sending...' : 'Send Test WhatsApp'}
          </button>
        )}

        <button
          onClick={() => saveMutation.mutate(form)}
          disabled={saveMutation.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Save size={16} />
          {saveMutation.isPending ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-display font-bold text-xl text-ink-bright">{value}</div>
      <div className="text-xs text-ink-muted mt-0.5">{label}</div>
    </div>
  )
}
