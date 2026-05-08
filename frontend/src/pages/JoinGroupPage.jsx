import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { groupsApi } from '../api/client'
import { useAuth } from '../contexts/AuthContext'
import { Users, Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function JoinGroupPage() {
  const { code } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState(code || '')
  const [loading, setLoading] = useState(false)

  const join = async () => {
    if (!user) { navigate(`/register`); return }
    setLoading(true)
    try {
      const { data } = await groupsApi.join(inviteCode.trim().toUpperCase())
      toast.success(`Joined "${data.group.name}"! Let's grind 🔥`)
      navigate(`/group/${data.group.id}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid invite code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-slide-up text-center">
        <div className="w-16 h-16 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Users size={28} className="text-brand-400" />
        </div>
        <h1 className="font-display font-bold text-2xl text-ink-bright mb-1">Join a Group</h1>
        <p className="text-ink-muted text-sm mb-6">Enter the invite code your friend shared.</p>

        <div className="card p-5 text-left">
          <label className="label">Invite Code</label>
          <input
            className="input font-mono text-center text-lg tracking-widest uppercase"
            placeholder="ABCD1234"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())}
            maxLength={8}
          />
          <button
            onClick={join}
            disabled={loading || inviteCode.length < 6}
            className="btn-primary w-full mt-4"
          >
            {loading ? 'Joining...' : 'Join Group'}
          </button>
        </div>

        {!user && (
          <p className="text-ink-muted text-xs mt-4">
            You'll need to <Link to="/register" className="text-brand-400">create an account</Link> first.
          </p>
        )}
        {user && (
          <Link to="/" className="text-ink-muted text-sm mt-4 block hover:text-ink-base transition-colors">
            ← Back to dashboard
          </Link>
        )}
      </div>
    </div>
  )
}
