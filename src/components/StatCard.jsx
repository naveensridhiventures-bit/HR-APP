export default function StatCard({ label, value, hint, tone = 'ink', icon: Icon }) {
  const tones = {
    ink: 'text-ink-800',
    saffron: 'text-saffron-700',
    rust: 'text-rust-600',
    stamp: 'text-stamp-600'
  }
  return (
    <div className="rounded-xl2 border border-ink-100 bg-paper-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate">{label}</p>
        {Icon && <Icon size={15} className="text-ink-400" />}
      </div>
      <p className={`mt-1.5 font-display text-3xl font-semibold ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate">{hint}</p>}
    </div>
  )
}
