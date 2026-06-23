import { relativeFollowUpLabel } from '../lib/date'

const toneClasses = {
  overdue:  'bg-rust-50 text-rust-600 border-rust/30',
  today:    'bg-saffron-50 text-saffron-700 border-saffron/30',
  upcoming: 'bg-stamp-50 text-stamp-600 border-stamp/30',
  future:   'bg-ink-50 text-ink-500 border-ink-100',
  muted:    'bg-ink-50 text-ink-400 border-ink-100',
}

export default function FollowUpBadge({ date }) {
  // Guard: convert anything (Date object, number, null) to string or null
  let safeDate = null
  if (date) {
    if (date instanceof Date) {
      safeDate = date.toISOString().slice(0, 10)
    } else if (typeof date === 'number') {
      safeDate = new Date(date).toISOString().slice(0, 10)
    } else {
      safeDate = String(date)
    }
  }

  const { label, tone } = relativeFollowUpLabel(safeDate)
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${toneClasses[tone] || toneClasses.muted}`}>
      {label}
    </span>
  )
}
