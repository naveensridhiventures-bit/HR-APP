import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Radar, TrendingUp, Users, Stamp as StampIcon } from 'lucide-react'
import { TopBar } from '../components/Shell'
import StatCard from '../components/StatCard'
import { EmptyState } from '../components/ui/Primitives'
import { useApp } from '../store/AppContext'
import {
  SOURCES, STAGES, ACTIVE_STAGE_KEYS, sourceMeta,
} from '../lib/constants'

// Stages grouped the way a lead funnel reads, left → right.
const FUNNEL_STAGES = STAGES.filter((s) => !['on_hold', 'terminated'].includes(s.key))

export default function Sources() {
  const { candidates, loading } = useApp()
  const navigate = useNavigate()

  const bySource = useMemo(() => {
    // Every known source, plus any custom ones actually present in the data —
    // so nothing gets hidden and nothing shows up as an empty phantom row.
    const present = new Set(candidates.map((c) => c.source).filter(Boolean))
    const names = [...new Set([...SOURCES, ...present])]

    return names.map((name) => {
      const leads = candidates.filter((c) => c.source === name)
      const active = leads.filter((c) => ACTIVE_STAGE_KEYS.includes(c.stage))
      const hired = leads.filter((c) => c.stage === 'hired')
      const rejected = leads.filter((c) => c.stage === 'rejected' || c.stage === 'terminated')
      const stageCounts = Object.fromEntries(FUNNEL_STAGES.map((s) => [s.key, leads.filter((c) => c.stage === s.key).length]))
      const conversion = leads.length ? Math.round((hired.length / leads.length) * 100) : 0
      return { name, leads, total: leads.length, active: active.length, hired: hired.length, rejected: rejected.length, stageCounts, conversion }
    }).filter((s) => s.total > 0 || SOURCES.includes(s.name))
      .sort((a, b) => b.total - a.total)
  }, [candidates])

  const totals = useMemo(() => {
    const total = candidates.length
    const hired = candidates.filter((c) => c.stage === 'hired').length
    const withSource = candidates.filter((c) => c.source).length
    const best = bySource.filter((s) => s.total >= 3).sort((a, b) => b.conversion - a.conversion)[0]
    return { total, hired, withSource, best }
  }, [candidates, bySource])

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="Lead Sources" subtitle="Every channel bringing in candidates — one clear pipeline per source" />

      <div className="grid grid-cols-2 gap-3 px-4 pt-4 sm:grid-cols-4 sm:px-6">
        <StatCard label="Total leads" value={loading ? '—' : totals.total} icon={Users} hint="all sources" />
        <StatCard label="Hired" value={loading ? '—' : totals.hired} tone="stamp" icon={StampIcon} hint="converted" />
        <StatCard
          label="Best channel"
          value={loading ? '—' : (totals.best?.name || '—')}
          tone="saffron"
          icon={TrendingUp}
          hint={totals.best ? `${totals.best.conversion}% conversion` : 'need more data'}
        />
        <StatCard label="Tagged" value={loading ? '—' : `${totals.total ? Math.round((totals.withSource / totals.total) * 100) : 0}%`} icon={Radar} hint="have a source set" />
      </div>

      <div className="px-4 pt-7 sm:px-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-800">Pipeline by source</h2>
          <span className="font-mono-data text-xs text-slate">{bySource.length} channels</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-sm text-slate">Loading…</div>
        ) : bySource.length === 0 ? (
          <EmptyState icon={Radar} title="No leads yet" subtitle="Add a candidate and tag their source to see it here." />
        ) : (
          <div className="space-y-3">
            {bySource.map((s) => {
              const meta = sourceMeta(s.name)
              return (
                <button
                  key={s.name}
                  onClick={() => navigate(`/candidates?source=${encodeURIComponent(s.name)}`)}
                  className="block w-full rounded-xl2 border border-ink-100 bg-paper-card p-4 text-left shadow-card hover:shadow-pop"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                      <span className="font-display text-base font-semibold text-ink-800">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate">
                      <span><strong className="font-mono-data text-sm text-ink-800">{s.total}</strong> leads</span>
                      <span className="text-stamp-600"><strong className="font-mono-data text-sm">{s.hired}</strong> hired</span>
                      <span className={s.conversion >= 20 ? 'text-stamp-600 font-semibold' : ''}>{s.conversion}% conversion</span>
                    </div>
                  </div>

                  {/* Funnel bar: stacked segments across the hiring stages */}
                  <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-ink-50">
                    {s.total > 0 && FUNNEL_STAGES.map((stage) => {
                      const count = s.stageCounts[stage.key] || 0
                      if (!count) return null
                      return (
                        <div
                          key={stage.key}
                          className={stage.dot}
                          style={{ width: `${(count / s.total) * 100}%` }}
                          title={`${stage.label}: ${count}`}
                        />
                      )
                    })}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate">
                    {FUNNEL_STAGES.map((stage) => {
                      const count = s.stageCounts[stage.key] || 0
                      if (!count) return null
                      return (
                        <span key={stage.key} className="flex items-center gap-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} /> {stage.label} {count}
                        </span>
                      )
                    })}
                    {s.rejected > 0 && <span className="text-rust-600">Rejected/Terminated {s.rejected}</span>}
                    {s.total === 0 && <span className="text-ink-300">No leads yet from this source</span>}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
