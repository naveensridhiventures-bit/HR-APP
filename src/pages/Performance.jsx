import { useMemo, useState } from 'react'
import { AlertTriangle, Phone, TrendingUp, UserCheck, UserX } from 'lucide-react'
import { TopBar } from '../components/Shell'
import { useApp } from '../store/AppContext'

const MONTHS = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i)
  return d.toISOString().slice(0, 7)
})

const monthLabel = (m) => {
  const [y, mo] = m.split('-')
  return new Date(+y, +mo - 1).toLocaleString('en-IN', { month: 'short', year: '2-digit' })
}

function InitialsAvatar({ name }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const colors = ['bg-saffron-100 text-saffron-700','bg-stamp-100 text-stamp-700','bg-ink-100 text-ink-700','bg-rust-100 text-rust-700']
  const idx = name.charCodeAt(0) % colors.length
  return (
    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${colors[idx]}`}>
      {initials}
    </div>
  )
}

function Bar({ value, max, color }) {
  const pct = max > 0 ? Math.round(value / max * 100) : 0
  return (
    <div className="h-2 overflow-hidden rounded-full bg-ink-50">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function Performance() {
  const { candidates, callLogs, hrList } = useApp()
  const [selectedMonth, setSelectedMonth] = useState('all')

  const stats = useMemo(() => {
    const logs = callLogs || []

    // filter candidates and calls by chosen month
    const inMonth = (date) => selectedMonth === 'all' ? true : (date || '').startsWith(selectedMonth)

    // For stage outcomes, use updatedAt to place them in time
    const hiredAll      = candidates.filter(c => c.stage === 'hired')
    const rejectedAll   = candidates.filter(c => c.stage === 'rejected')
    const terminatedAll = candidates.filter(c => c.stage === 'terminated')

    const hired      = hiredAll.filter(c => inMonth(c.updatedAt))
    const rejected   = rejectedAll.filter(c => inMonth(c.updatedAt))
    const terminated = terminatedAll.filter(c => inMonth(c.updatedAt))
    const calls      = logs.filter(l => inMonth(l.date))

    const hrStats = hrList.map(hr => {
      const h  = hired.filter(c => c.assignedTo === hr).length
      const r  = rejected.filter(c => c.assignedTo === hr).length
      const t  = terminated.filter(c => c.assignedTo === hr).length
      const c  = calls.filter(l => l.hr === hr).length

      // total currently assigned (all-time, not filtered by month)
      const totalAssigned = candidates.filter(x => x.assignedTo === hr).length
      // active pipeline for this HR
      const active = candidates.filter(x => x.assignedTo === hr &&
        ['applied','screening','interview','offer'].includes(x.stage)).length

      const rate = h + r > 0 ? Math.round(h / (h + r) * 100) : null

      const hiredCands = candidates.filter(x =>
        x.assignedTo === hr && x.stage === 'hired' && x.createdAt && x.updatedAt)
      const avgDays = hiredCands.length
        ? Math.round(hiredCands.reduce((acc, x) =>
            acc + (new Date(x.updatedAt) - new Date(x.createdAt)) / 86400000, 0) / hiredCands.length)
        : null

      return { hr, hired: h, rejected: r, terminated: t, calls: c, totalAssigned, active, rate, avgDays }
    })

    return { hired, rejected, terminated, calls, hrStats }
  }, [candidates, callLogs, hrList, selectedMonth])

  const maxCalls  = Math.max(...stats.hrStats.map(h => h.calls), 1)
  const maxHired  = Math.max(...stats.hrStats.map(h => h.hired), 1)
  const totalHired = stats.hired.length
  const totalCalls = stats.calls.length

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="HR Performance" subtitle="Recruiter stats, hiring outcomes & call activity" />

      <div className="px-4 pt-5 sm:px-6">

        {/* Period selector */}
        <div className="mb-5 flex flex-wrap gap-2">
          <button onClick={() => setSelectedMonth('all')}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              selectedMonth === 'all' ? 'border-ink-800 bg-ink-800 text-paper' : 'border-ink-100 text-slate hover:border-ink-300'
            }`}>
            All time
          </button>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setSelectedMonth(m)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                m === selectedMonth ? 'border-ink-800 bg-ink-800 text-paper' : 'border-ink-100 text-slate hover:border-ink-300'
              }`}>
              {monthLabel(m)}
            </button>
          ))}
        </div>

        {/* Termination alert */}
        {stats.terminated.length > 0 && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-rust/30 bg-rust-50 px-4 py-3 text-sm text-rust-600">
            <AlertTriangle size={16} className="shrink-0" />
            <span>
              <strong>{stats.terminated.length}</strong> termination{stats.terminated.length > 1 ? 's' : ''} recorded
              {selectedMonth !== 'all' && ` in ${monthLabel(selectedMonth)}`} — review recommended
            </span>
          </div>
        )}

        {/* Top summary strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Hired',      value: stats.hired.length,      color: 'text-stamp-600',   bg: 'bg-stamp-50',  icon: UserCheck },
            { label: 'Rejected',   value: stats.rejected.length,   color: 'text-rust-600',    bg: 'bg-rust-50',   icon: UserX },
            { label: 'Terminated', value: stats.terminated.length, color: 'text-rust-700',    bg: 'bg-rust-50',   icon: AlertTriangle },
            { label: 'Total calls',value: stats.calls.length,      color: 'text-ink-800',     bg: 'bg-ink-50',    icon: Phone },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border border-ink-100 ${s.bg} p-4`}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate">{s.label}</p>
                <s.icon size={15} className="text-slate/60" />
              </div>
              <p className={`mt-1 font-display text-3xl font-semibold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-[11px] text-slate">
                {selectedMonth === 'all' ? 'all time' : monthLabel(selectedMonth)}
              </p>
            </div>
          ))}
        </div>

        {/* Per-HR cards */}
        <h2 className="mb-3 font-display text-base font-semibold text-ink-800">Recruiter breakdown</h2>

        {stats.hrStats.length === 0 ? (
          <p className="text-sm text-slate">No HR team members yet. Add them in Settings.</p>
        ) : (
          <div className="space-y-3">
            {stats.hrStats
              .sort((a, b) => b.hired - a.hired || b.calls - a.calls)
              .map((h, rank) => (
              <div key={h.hr} className="rounded-xl border border-ink-100 bg-paper-card">
                {/* Card header */}
                <div className="flex items-center gap-3 p-4 pb-3">
                  <InitialsAvatar name={h.hr} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-ink-800">{h.hr}</p>
                      {rank === 0 && (h.hired > 0 || h.calls > 0) && (
                        <span className="rounded-full bg-saffron px-2 py-0.5 text-[10px] font-bold text-white">TOP</span>
                      )}
                    </div>
                    <p className="text-xs text-slate">
                      {h.totalAssigned} assigned total · {h.active} active in pipeline
                    </p>
                  </div>
                  {/* Hire rate badge */}
                  <div className="text-right">
                    {h.rate !== null ? (
                      <>
                        <p className={`font-display text-2xl font-semibold ${
                          h.rate >= 60 ? 'text-stamp-600' : h.rate >= 30 ? 'text-saffron-700' : 'text-slate'
                        }`}>{h.rate}%</p>
                        <p className="text-[10px] text-slate">hire rate</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate">No closed</p>
                    )}
                  </div>
                </div>

                {/* Stat row */}
                <div className="grid grid-cols-4 gap-px border-t border-ink-100 bg-ink-100">
                  {[
                    { label: 'Calls',      val: h.calls,      color: 'text-ink-700' },
                    { label: 'Hired',      val: h.hired,      color: 'text-stamp-600' },
                    { label: 'Rejected',   val: h.rejected,   color: 'text-rust-600' },
                    { label: 'Terminated', val: h.terminated, color: 'text-rust-700' },
                  ].map(s => (
                    <div key={s.label} className="bg-paper-card px-3 py-2.5 text-center">
                      <p className={`font-display text-lg font-semibold ${s.color}`}>{s.val}</p>
                      <p className="text-[10px] text-slate">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Progress bars */}
                <div className="space-y-2 p-4 pt-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate">
                      <span>Calls activity</span><span className="font-medium text-ink-700">{h.calls} calls</span>
                    </div>
                    <Bar value={h.calls} max={maxCalls} color="bg-ink-600" />
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate">
                      <span>Hires</span><span className="font-medium text-ink-700">{h.hired} hired</span>
                    </div>
                    <Bar value={h.hired} max={maxHired} color="bg-stamp" />
                  </div>
                  {h.avgDays !== null && (
                    <p className="pt-1 text-xs text-slate">
                      <TrendingUp size={11} className="mr-1 inline" />
                      Avg time-to-hire: <strong className="text-ink-700">{h.avgDays} days</strong>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hired table */}
        {stats.hired.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 font-display text-base font-semibold text-ink-800">
              Hired {selectedMonth === 'all' ? '— all time' : `in ${monthLabel(selectedMonth)}`}
            </h2>
            <ResultTable rows={stats.hired} />
          </>
        )}

        {/* Rejected table */}
        {stats.rejected.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 font-display text-base font-semibold text-ink-800">
              Rejected {selectedMonth === 'all' ? '— all time' : `in ${monthLabel(selectedMonth)}`}
            </h2>
            <ResultTable rows={stats.rejected} />
          </>
        )}

        {/* Terminated table */}
        {stats.terminated.length > 0 && (
          <>
            <h2 className="mb-3 mt-6 font-display text-base font-semibold text-rust-600">
              Terminated {selectedMonth === 'all' ? '— all time' : `in ${monthLabel(selectedMonth)}`}
            </h2>
            <ResultTable rows={stats.terminated} accent="rust" />
          </>
        )}

        {stats.hired.length === 0 && stats.rejected.length === 0 && stats.terminated.length === 0 && (
          <div className="mt-8 rounded-xl border border-ink-100 bg-paper-card p-6 text-center">
            <p className="text-sm font-medium text-ink-700">No closed candidates yet</p>
            <p className="mt-1 text-xs text-slate">
              {selectedMonth === 'all'
                ? 'Move candidates to Hired, Rejected, or Terminated to see them here.'
                : `Try "All time" to see the full picture, or pick a different month.`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultTable({ rows, accent }) {
  const borderClass = accent === 'rust' ? 'border-rust/30' : 'border-ink-100'
  const headBg      = accent === 'rust' ? 'bg-rust-50 text-rust-600' : 'bg-paper-dim text-slate'
  return (
    <div className={`overflow-hidden rounded-xl border ${borderClass} bg-paper-card`}>
      <table className="w-full text-sm">
        <thead className={`text-left text-xs font-semibold uppercase tracking-wide ${headBg}`}>
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Recruiter</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.id} className={`border-t ${borderClass}`}>
              <td className="px-4 py-2.5 font-medium text-ink-800">{c.name}</td>
              <td className="px-4 py-2.5 text-slate">{c.role || c.department || '—'}</td>
              <td className="px-4 py-2.5 text-slate">{c.assignedTo || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
