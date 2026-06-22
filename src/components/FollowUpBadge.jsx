import { relativeFollowUpLabel } from '../lib/date'

const TONE_CLASSES = {
  overdue: 'bg-rust-50 text-rust-600',
  today: 'bg-saffron-50 text-saffron-700',
  upcoming: 'bg-stamp-50 text-stamp-600',
  future: 'bg-ink-50 text-ink-600',
  muted: 'bg-ink-50 text-slate'
}

export default function FollowUpBadge({ date, className = '' }) {
  const { label, tone } = relativeFollowUpLabel(date)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${TONE_CLASSES[tone]} ${className}`}>
      {label}
    </span>
  )
}
