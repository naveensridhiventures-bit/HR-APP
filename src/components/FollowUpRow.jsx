import { Phone } from 'lucide-react'
import { Avatar } from './ui/Primitives'
import FollowUpBadge from './FollowUpBadge'
import WhatsAppMenu from './WhatsAppMenu'
import { telLink } from '../lib/contact'
import { useUi } from '../store/UiContext'

export default function FollowUpRow({ candidate, departments = [] }) {
  const { openCandidate } = useUi()
  const deptLabel = departments.find((d) => d.key === candidate.department)?.label || candidate.department

  return (
    <button
      onClick={() => openCandidate(candidate.id)}
      className="flex w-full items-center gap-3 rounded-xl2 border border-ink-100 bg-paper-card p-3 text-left shadow-card hover:shadow-pop"
    >
      <Avatar name={candidate.name} size={38} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-800">{candidate.name}</p>
        <p className="truncate text-xs text-slate">{deptLabel} {candidate.role && `· ${candidate.role}`}</p>
      </div>
      <FollowUpBadge date={candidate.nextFollowUp} />
      <div className="flex items-center gap-1">
        <a href={telLink(candidate.phone)} onClick={(e) => e.stopPropagation()} className="rounded-full p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700" aria-label="Call">
          <Phone size={14} />
        </a>
        <WhatsAppMenu candidate={candidate} deptLabel={deptLabel} size={14} />
      </div>
    </button>
  )
}
