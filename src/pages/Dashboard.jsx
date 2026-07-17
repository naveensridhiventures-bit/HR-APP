import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, Stamp as StampIcon, Users, AlertTriangle } from 'lucide-react'
import { TopBar } from '../components/Shell'
import StatCard from '../components/StatCard'
import FollowUpRow from '../components/FollowUpRow'
import { EmptyState } from '../components/ui/Primitives'
import { useApp } from '../store/AppContext'
import { ACTIVE_STAGE_KEYS, CLOSED_STAGE_KEYS, sourceMeta } from '../lib/constants'
import { Radar } from 'lucide-react'
import { isOverdue, isToday, formatDateFull } from '../lib/date'

export default function Dashboard() {
  const { candidates, departments, loading, usingLocalFallback } = useApp()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const active = candidates.filter((c) => ACTIVE_STAGE_KEYS.includes(c.stage))
    const overdue = active.filter((c) => isOverdue(c.nextFollowUp))
    const today = active.filter((c) => isToday(c.nextFollowUp))
    const thisMonth = new Date().toISOString().slice(0, 7)
    const hiredThisMonth = candidates.filter((c) => c.stage === 'hired' && (c.updatedAt || '').startsWith(thisMonth))
    return { active, overdue, today, hiredThisMonth }
  }, [candidates])

  const registerList = useMemo(
    () => [...stats.overdue, ...stats.today].sort((a, b) => (a.nextFollowUp < b.nextFollowUp ? -1 : 1)),
    [stats]
  )

  const byDept = useMemo(() => departments.map((d) => {
    const all = candidates.filter((c) => c.department === d.key)
    const active = all.filter((c) => ACTIVE_STAGE_KEYS.includes(c.stage))
    const hired = all.filter((c) => c.stage === 'hired')
    return { ...d, total: all.length, active: active.length, hired: hired.length }
  }), [departments, candidates])

  const topSources = useMemo(() => {
    const counts = {}
    candidates.forEach((c) => { if (c.source) counts[c.source] = (counts[c.source] || 0) + 1 })
    return Object.entries(counts)
      .map(([name, total]) => ({ name, total, hired: candidates.filter((c) => c.source === name && c.stage === 'hired').length }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [candidates])
  const maxSourceTotal = Math.max(1, ...topSources.map((s) => s.total))

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="Dashboard" subtitle={formatDateFull(new Date().toISOString().slice(0, 10))} />

      {usingLocalFallback && (
        <div className="mx-4 mt-4 rounded-xl2 border border-saffron/30 bg-saffron-50 px-4 py-3 text-sm text-saffron-700 sm:mx-6">
          You're viewing sample data. Connect your Google Sheet from <button onClick={() => navigate('/settings')} className="font-semibold underline">Settings</button> to track real candidates.
        </div>
      )}

      {!loading && stats.overdue.length > 0 && (
        <button
          onClick={() => navigate('/followups')}
          className="mx-4 mt-4 flex w-[calc(100%-2rem)] items-center justify-between rounded-xl2 border border-rust/30 bg-rust-50 px-4 py-3 text-left text-sm text-rust-600 sm:mx-6 sm:w-[calc(100%-3rem)]"
        >
          <span className="font-semibold">
            {stats.overdue.length} follow-up{stats.overdue.length > 1 ? 's are' : ' is'} overdue — someone is waiting on a call
          </span>
          <span className="shrink-0 underline">View now →</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 px-4 pt-4 sm:grid-cols-4 sm:px-6">
        <StatCard label="Active pipeline" value={loading ? '—' : stats.active.length} icon={Users} hint="across all roles" />
        <StatCard label="Due today" value={loading ? '—' : stats.today.length} tone="saffron" icon={CalendarCheck} hint="follow-ups" />
        <StatCard label="Overdue" value={loading ? '—' : stats.overdue.length} tone="rust" icon={AlertTriangle} hint="needs a call" />
        <StatCard label="Hired this month" value={loading ? '—' : stats.hiredThisMonth.length} tone="stamp" icon={StampIcon} hint="joined" />
      </div>

      <div className="px-4 pt-6 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-800">Today's register</h2>
          <span className="font-mono-data text-xs text-slate">{registerList.length} to call</span>
        </div>
        {registerList.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="Nothing due today" subtitle="You're fully caught up on follow-ups. Nice work." />
        ) : (
          <div className="space-y-2">
            {registerList.slice(0, 6).map((c) => (
              <FollowUpRow key={c.id} candidate={c} departments={departments} />
            ))}
          </div>
        )}
        {registerList.length > 6 && (
          <button onClick={() => navigate('/followups')} className="mt-3 text-sm font-semibold text-saffron-700 hover:underline">
            View all {registerList.length} follow-ups →
          </button>
        )}
      </div>

      <div className="px-4 pt-7 sm:px-6">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink-800">Pipelines</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {byDept.map((d) => (
            <button
              key={d.key}
              onClick={() => navigate(`/pipeline?dept=${d.key}`)}
              className="rounded-xl2 border border-ink-100 bg-paper-card p-4 text-left shadow-card hover:shadow-pop"
            >
              <p className="font-display text-base font-semibold text-ink-800">{d.label}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-slate">
                <span>{d.active} active</span>
                <span className="text-stamp-600">{d.hired} hired</span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-50">
                <div
                  className="h-full bg-stamp"
                  style={{ width: `${d.total ? Math.round((d.hired / d.total) * 100) : 0}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {topSources.length > 0 && (
        <div className="px-4 pt-7 sm:px-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink-800">Leads by source</h2>
            <button onClick={() => navigate('/sources')} className="flex items-center gap-1 text-sm font-semibold text-saffron-700 hover:underline">
              <Radar size={14} /> View all
            </button>
          </div>
          <div className="rounded-xl2 border border-ink-100 bg-paper-card p-4 shadow-card">
            <div className="space-y-3">
              {topSources.map((s) => {
                const meta = sourceMeta(s.name)
                return (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                    <span className="w-32 shrink-0 truncate text-sm font-medium text-ink-800 sm:w-40">{s.name}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-50">
                      <div className={`h-full ${meta.dot}`} style={{ width: `${(s.total / maxSourceTotal) * 100}%` }} />
                    </div>
                    <span className="w-8 shrink-0 text-right font-mono-data text-xs text-slate">{s.total}</span>
                    <span className="w-16 shrink-0 text-right text-xs text-stamp-600">{s.hired} hired</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
