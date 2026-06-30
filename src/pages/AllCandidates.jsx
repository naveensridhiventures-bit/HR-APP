import { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { TopBar } from '../components/Shell'
import { Avatar, EmptyState } from '../components/ui/Primitives'
import FollowUpBadge from '../components/FollowUpBadge'
import { useApp } from '../store/AppContext'
import { useUi } from '../store/UiContext'
import { STAGES, stageBadgeClasses, CALL_STATUS_MAP } from '../lib/constants'
import { formatDateTime } from '../lib/date'
import { exportCandidatesCsv } from '../lib/csv'
import { Users } from 'lucide-react'

export default function AllCandidates() {
  const { candidates, departments } = useApp()
  const { openCandidate } = useUi()
  const [query, setQuery] = useState('')
  const [dept, setDept] = useState('all')
  const [stage, setStage] = useState('all')

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (dept !== 'all' && c.department !== dept) return false
      if (stage !== 'all' && c.stage !== stage) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        if (!c.name?.toLowerCase().includes(q) && !c.phone?.includes(query)) return false
      }
      return true
    }).sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
  }, [candidates, dept, stage, query])

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="All candidates" subtitle={`${candidates.length} total across every pipeline`} />

      <div className="flex flex-wrap items-center gap-2 px-4 pt-3 sm:px-6">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or phone…"
            className="w-full rounded-lg border border-ink-100 bg-paper-card py-2 pl-9 pr-3 text-sm outline-none focus:border-saffron"
          />
        </div>
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm">
          <option value="all">All pipelines</option>
          {departments.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)} className="rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm">
          <option value="all">All stages</option>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <button
          onClick={() => exportCandidatesCsv(filtered, departments)}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No candidates match" subtitle="Try a different search or clear your filters." />
      ) : (
        <div className="mt-4 px-4 sm:px-6">
          <div className="overflow-hidden rounded-xl2 border border-ink-100 bg-paper-card">
            <table className="w-full text-sm">
              <thead className="bg-paper-dim text-left text-xs font-semibold uppercase tracking-wide text-slate">
                <tr>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="hidden px-4 py-3 sm:table-cell">Pipeline</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Call status</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Follow-up</th>
                  <th className="hidden px-4 py-3 md:table-cell">Added</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const deptLabel = departments.find((d) => d.key === c.department)?.label || c.department
                  const status = CALL_STATUS_MAP[c.callStatus]
                  return (
                    <tr
                      key={c.id}
                      onClick={() => openCandidate(c.id)}
                      className={`cursor-pointer border-t border-ink-100 hover:bg-paper-dim/50 ${
                        status ? { positive: 'border-l-4 border-l-stamp', rnr: 'border-l-4 border-l-amber', followup: 'border-l-4 border-l-sky', rejected: 'border-l-4 border-l-rust' }[c.callStatus] : ''
                      }`}
                    >
                      <td className="flex items-center gap-2.5 px-4 py-3">
                        <Avatar name={c.name} size={32} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink-800">{c.name}</p>
                          <p className="font-mono-data text-xs text-slate">{c.phone}</p>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-slate sm:table-cell">{deptLabel}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${stageBadgeClasses(c.stage)}`}>
                          {STAGES.find((s) => s.key === c.stage)?.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {status ? (
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badge}`}>{status.label}</span>
                        ) : <span className="text-xs text-ink-300">—</span>}
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell"><FollowUpBadge date={c.nextFollowUp} /></td>
                      <td className="hidden px-4 py-3 text-xs text-slate md:table-cell">{formatDateTime(c.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
