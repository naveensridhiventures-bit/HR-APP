import { useMemo, useState } from 'react'
import { TopBar } from '../components/Shell'
import FollowUpRow from '../components/FollowUpRow'
import { EmptyState } from '../components/ui/Primitives'
import { useApp } from '../store/AppContext'
import { ACTIVE_STAGE_KEYS } from '../lib/constants'
import { isOverdue, isToday, isUpcoming } from '../lib/date'
import { CalendarClock } from 'lucide-react'

const TABS = [
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'all', label: 'All scheduled' }
]

export default function FollowUps() {
  const { candidates, departments } = useApp()
  const [tab, setTab] = useState('overdue')

  const active = useMemo(() => candidates.filter((c) => ACTIVE_STAGE_KEYS.includes(c.stage) && c.nextFollowUp), [candidates])

  const filtered = useMemo(() => {
    const sorted = [...active].sort((a, b) => (a.nextFollowUp < b.nextFollowUp ? -1 : 1))
    if (tab === 'overdue') return sorted.filter((c) => isOverdue(c.nextFollowUp))
    if (tab === 'today') return sorted.filter((c) => isToday(c.nextFollowUp))
    if (tab === 'upcoming') return sorted.filter((c) => isUpcoming(c.nextFollowUp, 14))
    return sorted
  }, [active, tab])

  const counts = useMemo(() => ({
    overdue: active.filter((c) => isOverdue(c.nextFollowUp)).length,
    today: active.filter((c) => isToday(c.nextFollowUp)).length,
    upcoming: active.filter((c) => isUpcoming(c.nextFollowUp, 14)).length,
    all: active.length
  }), [active])

  return (
    <div className="pb-24 lg:pb-10">
      <TopBar title="Follow-ups" subtitle="Every call you owe a candidate, in one queue" />
      <div className="flex gap-2 overflow-x-auto px-4 pt-3 sm:px-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              tab === t.key ? 'border-ink-800 bg-ink-800 text-paper' : 'border-ink-100 text-slate hover:bg-ink-50'
            }`}
          >
            {t.label} <span className="font-mono-data text-xs opacity-70">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="space-y-2 px-4 pt-4 sm:px-6">
        {filtered.length === 0 ? (
          <EmptyState icon={CalendarClock} title="Nothing here" subtitle="No follow-ups in this queue right now." />
        ) : (
          filtered.map((c) => <FollowUpRow key={c.id} candidate={c} departments={departments} />)
        )}
      </div>
    </div>
  )
}
