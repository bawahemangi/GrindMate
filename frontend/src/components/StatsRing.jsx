export default function StatsRing({ percent, completed, total, streak }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="rotate-[-90deg]" width="144" height="144" viewBox="0 0 144 144">
          <circle cx="72" cy="72" r={r} fill="none" stroke="#22222c" strokeWidth="12" />
          <circle
            cx="72" cy="72" r={r} fill="none"
            stroke="#f97316" strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-3xl text-ink-bright">{percent}%</span>
          <span className="text-xs text-ink-muted font-mono">{completed}/{total}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 bg-brand-500/10 px-3 py-1.5 rounded-full">
        <span className="text-lg">🔥</span>
        <span className="font-display font-semibold text-brand-400 text-sm">{streak} day streak</span>
      </div>
    </div>
  )
}
