import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Flame } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-0 px-4">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-ink-bright">GrindTracker</span>
        </div>

        <div className="card p-6">
          <h1 className="font-display font-bold text-xl text-ink-bright mb-1">Welcome back</h1>
          <p className="text-ink-muted text-sm mb-6">Log in and get back to grinding.</p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email" className="input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="text-center text-ink-muted text-sm mt-4">
          No account?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
