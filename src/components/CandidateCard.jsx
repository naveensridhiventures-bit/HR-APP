import { Phone } from 'lucide-react'
import { Avatar, SourceBadge } from './ui/Primitives'
import FollowUpBadge from './FollowUpBadge'
import WhatsAppMenu from './WhatsAppMenu'
import { telLink } from '../lib/contact'
import { useUi } from '../store/UiContext'
import { DEFAULT_DEPARTMENTS, CALL_STATUS_MAP, callStatusCardClasses } from '../lib/constants'
import { formatDateTime } from '../lib/date'

export default function CandidateCard({ candidate, departments = DEFAULT_DEPARTMENTS, draggableProps, dragHandleProps, innerRef, dragging }) {
  const { openCandidate } = useUi()
  const deptLabel = departments.find((d) => d.key === candidate.department)?.label || candidate.department
  const status = CALL_STATUS_MAP[candidate.callStatus]

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      onClick={() => openCandidate(candidate.id)}
      className={`group cursor-pointer rounded-xl2 border border-ink-100 bg-paper-card p-3.5 shadow-card transition-shadow hover:shadow-pop ${callStatusCardClasses(candidate.callStatus)} ${dragging ? 'rotate-1 shadow-pop' : ''}`}
    >
      <div className="flex items-start gap-2.5">
        <Avatar name={candidate.name} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-800">{candidate.name}</p>
          <p className="truncate text-xs text-slate">{candidate.role || deptLabel}</p>
        </div>
        {status && (
          <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold leading-none ${status.badge}`}>
            {status.label.replace(/^\S+\s/, '')}
          </span>
        )}
      </div>

      {candidate.source && (
        <div className="mt-2.5">
          <SourceBadge source={candidate.source} size="xs" />
        </div>
      )}

      <div className="mt-2.5 flex items-center justify-between">
        <FollowUpBadge date={candidate.nextFollowUp} />
        <div className="flex items-center gap-1 opacity-80">
          <a
            href={telLink(candidate.phone)}
            onClick={(e) => e.stopPropagation()}
            className="rounded-full p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            aria-label="Call"
          >
            <Phone size={14} />
          </a>
          <WhatsAppMenu candidate={candidate} deptLabel={deptLabel} size={14} />
        </div>
      </div>

      <p className="mt-2 truncate text-[10.5px] font-medium text-ink-400">
        Added {formatDateTime(candidate.createdAt)}
      </p>
    </div>
  )
}
