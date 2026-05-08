import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Welcome to the grind 🔥')
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      const msg = data
        ? Object.values(data).flat().join(', ')
        : 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-ink-bright">GrindTracker</span>
        </div>

        <div className="card p-6">
          <h1 className="font-display font-bold text-xl text-ink-bright mb-1">Create account</h1>
          <p className="text-ink-muted text-sm mb-6">Join your crew and track the grind.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Username</label>
              <input className="input" placeholder="coolhacker" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 6 chars" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            <div>
              <label className="label">
                WhatsApp Number <span className="text-ink-muted font-normal">(optional, for reminders)</span>
              </label>
              <input className="input" placeholder="+919876543210" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-muted text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Log in</Link>
        </p>
      </div>
    </div>
  )
}
