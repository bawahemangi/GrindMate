import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { groupsApi } from '../api/client'
import {
  LayoutDashboard, Users, Trophy, User, LogOut,
  Flame, ChevronRight, Plus
} from 'lucide-react'
import { useState } from 'react'
import CreateGroupModal from './CreateGroupModal'
import clsx from 'clsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list().then(r => r.data.results || r.data),
  })

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-1 border-r border-surface-3 flex flex-col fixed h-full z-10">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-surface-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-ink-bright text-lg">GrindTracker</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavItem to="/" icon={<LayoutDashboard size={16} />} label="Dashboard" end />

          {/* Groups */}
          <div className="pt-4 pb-1 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-ink-muted uppercase tracking-widest">Groups</span>
              <button
                onClick={() => setShowCreate(true)}
                className="w-5 h-5 rounded-md bg-surface-3 hover:bg-brand-500 flex items-center justify-center transition-colors"
              >
                <Plus size={12} className="text-ink-subtle hover:text-white" />
              </button>
            </div>
          </div>

          {groups.map(group => (
            <div key={group.id}>
              <NavLink
                to={`/group/${group.id}`}
                className={({ isActive }) => clsx(
                  'flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all group',
                  isActive
                    ? 'bg-brand-500/10 text-brand-400 font-medium'
                    : 'text-ink-subtle hover:text-ink-base hover:bg-surface-2'
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-surface-3 flex items-center justify-center text-xs font-display font-bold text-brand-400">
                    {group.name[0].toUpperCase()}
                  </div>
                  <span className="font-body truncate max-w-[100px]">{group.name}</span>
                </div>
                <span className="text-xs text-ink-muted">{group.member_count}</span>
              </NavLink>
            </div>
          ))}

          {groups.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-ink-muted hover:text-ink-subtle transition-colors border border-dashed border-surface-3 hover:border-surface-4"
            >
              <Plus size={14} />
              <span>Create your first group</span>
            </button>
          )}

          <div className="pt-4 pb-1 px-3">
            <span className="text-xs font-mono text-ink-muted uppercase tracking-widest">Account</span>
          </div>
          <NavItem to="/profile" icon={<User size={16} />} label="Profile" />
        </nav>

        {/* User footer */}
        <div className="px-3 py-3 border-t border-surface-3">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-display font-bold text-sm">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-ink-bright truncate">{user?.username}</div>
              <div className="text-xs text-ink-muted flex items-center gap-1">
                <Flame size={10} className="text-brand-400" />
                {user?.current_streak || 0} day streak
              </div>
            </div>
            <button onClick={handleLogout} className="text-ink-muted hover:text-red-400 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 min-h-screen bg-surface-0">
        <Outlet />
      </main>

      {showCreate && <CreateGroupModal onClose={() => setShowCreate(false)} />}
    </div>
  )
}

function NavItem({ to, icon, label, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => clsx(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-all',
        isActive
          ? 'bg-brand-500/10 text-brand-400 font-medium'
          : 'text-ink-subtle hover:text-ink-base hover:bg-surface-2'
      )}
    >
      {icon}
      <span className="font-body">{label}</span>
    </NavLink>
  )
}
