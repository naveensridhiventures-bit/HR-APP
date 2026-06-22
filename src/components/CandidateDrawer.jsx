import { useMemo, useState } from 'react'
import { Edit3, Phone, PhoneCall, Trash2, UserCog } from 'lucide-react'
import { Avatar, ConfirmDialog, Sheet, Stamp } from './ui/Primitives'
import FollowUpBadge from './FollowUpBadge'
import WhatsAppMenu from './WhatsAppMenu'
import { useApp } from '../store/AppContext'
import { useUi } from '../store/UiContext'
import { STAGES, stageBadgeClasses } from '../lib/constants'
import { formatDateFull, timeAgo, todayISO } from '../lib/date'
import { telLink } from '../lib/contact'

const OUTCOMES = [
  { key: 'positive',  label: '✅ Positive',      color: 'text-stamp-600' },
  { key: 'neutral',   label: '🔄 Follow up',      color: 'text-saffron-700' },
  { key: 'negative',  label: '❌ Not interested', color: 'text-rust-600' },
  { key: 'no_answer', label: '📵 No answer',      color: 'text-slate' },
]

export default function CandidateDrawer() {
  const { openCandidateId, closeCandidate } = useUi()
  const { candidates, departments, hrList, followups, callLogs,
          moveStage, updateCandidate, deleteCandidate, addFollowUp, addCallLog } = useApp()

  const [tab, setTab]                   = useState('followup')
  const [editing, setEditing]           = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [reassigning, setReassigning]   = useState(false)

  // follow-up form
  const [note, setNote]         = useState('')
  const [nextDate, setNextDate] = useState(todayISO())
  const [savingNote, setSavingNote] = useState(false)

  // call log form
  const [callNote, setCallNote]     = useState('')
  const [callOutcome, setCallOutcome] = useState('neutral')
  const [savingCall, setSavingCall]   = useState(false)

  const candidate = candidates.find(c => c.id === openCandidateId)

  const history = useMemo(
    () => followups.filter(f => f.candidateId === openCandidateId)
                   .sort((a, b) => b.date > a.date ? 1 : -1),
    [followups, openCandidateId]
  )
  const candCallLogs = useMemo(
    () => (callLogs || []).filter(l => l.candidateId === openCandidateId)
                          .sort((a, b) => b.date > a.date ? 1 : -1),
    [callLogs, openCandidateId]
  )

  if (!candidate) return null

  const deptLabel = departments.find(d => d.key === candidate.department)?.label || candidate.department

  const logFollowUp = async (e) => {
    e.preventDefault()
    if (!note.trim()) return
    setSavingNote(true)
    try { await addFollowUp(candidate.id, { note: note.trim(), nextFollowUp: nextDate || null }); setNote('') }
    finally { setSavingNote(false) }
  }

  const logCall = async (e) => {
    e.preventDefault()
    if (!callNote.trim()) return
    setSavingCall(true)
    try {
      await addCallLog(candidate.id, { hr: candidate.assignedTo || '', note: callNote.trim(), outcome: callOutcome })
      setCallNote('')
    } finally { setSavingCall(false) }
  }

  const reassignHR = async (newHr) => {
    await updateCandidate(candidate.id, { assignedTo: newHr })
    setReassigning(false)
  }

  const tabs = [
    { key: 'followup', label: 'Follow-up' },
    { key: 'calls',    label: `Calls (${candCallLogs.length})` },
  ]

  return (
    <Sheet open={Boolean(candidate)} onClose={closeCandidate} title="Candidate">

      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <Avatar name={candidate.name} size={52} />
        <div className="min-w-0 flex-1">
          {editing ? (
            <input defaultValue={candidate.name}
              onBlur={e => updateCandidate(candidate.id, { name: e.target.value })}
              className="w-full rounded-lg border border-ink-100 px-2 py-1 font-display text-lg font-semibold outline-none focus:border-saffron" />
          ) : (
            <h3 className="truncate font-display text-lg font-semibold text-ink-800">{candidate.name}</h3>
          )}
          <p className="truncate text-sm text-slate">{candidate.role || '—'} · {deptLabel}</p>
          <p className="font-mono-data text-xs text-ink-400">{candidate.phone}</p>
        </div>
        <button onClick={() => setEditing(v => !v)}
          className="rounded-full p-2 text-slate hover:bg-ink-50">
          <Edit3 size={16} />
        </button>
      </div>

      {candidate.stage === 'hired'      && <div className="mt-3"><Stamp tone="stamp">Hired ✓</Stamp></div>}
      {candidate.stage === 'terminated' && <div className="mt-3"><Stamp tone="rust">Terminated</Stamp></div>}

      {/* ── Quick actions ── */}
      <div className="mt-4 flex gap-2">
        <a href={telLink(candidate.phone)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-ink-100 bg-paper py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50">
          <Phone size={15} /> Call
        </a>
        <WhatsAppMenu candidate={candidate} deptLabel={deptLabel} variant="button" />
      </div>

      {/* ── Assigned HR row with reassign ── */}
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-ink-100 bg-paper-card px-3 py-2.5">
        <UserCog size={15} className="shrink-0 text-slate" />
        <div className="flex-1 min-w-0">
          {reassigning ? (
            <div className="flex items-center gap-2">
              <select
                defaultValue={candidate.assignedTo || ''}
                onChange={e => reassignHR(e.target.value)}
                autoFocus
                className="flex-1 rounded-lg border border-saffron bg-paper-card px-2 py-1 text-sm outline-none"
              >
                <option value="">Unassigned</option>
                {hrList.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <button onClick={() => setReassigning(false)}
                className="text-xs text-slate hover:text-ink-700">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <span className="text-xs text-slate">Assigned HR · </span>
                <span className="text-sm font-semibold text-ink-800">
                  {candidate.assignedTo || <span className="font-normal text-slate">Unassigned</span>}
                </span>
                {candidate.source && (
                  <span className="ml-2 text-xs text-slate">· {candidate.source}</span>
                )}
              </div>
              <button
                onClick={() => setReassigning(true)}
                className="ml-2 shrink-0 rounded-md border border-ink-100 px-2 py-1 text-xs font-medium text-slate hover:border-saffron hover:text-saffron-700"
              >
                Reassign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stage buttons ── */}
      <div className="mt-5">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate">Pipeline stage</p>
        <div className="flex flex-wrap gap-1.5">
          {STAGES.map(s => (
            <button key={s.key} onClick={() => moveStage(candidate.id, s.key)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                candidate.stage === s.key
                  ? stageBadgeClasses(s.key) + ' ring-1 ring-inset ring-current'
                  : 'border-ink-100 text-slate hover:bg-ink-50'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="mt-5 flex gap-4 border-b border-ink-100">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-2 text-sm font-semibold transition-colors ${
              tab === t.key ? 'border-b-2 border-ink-800 text-ink-800' : 'text-slate hover:text-ink-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Follow-up tab ── */}
      {tab === 'followup' && (
        <>
          <div className="mt-4 rounded-xl border border-ink-100 bg-paper p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate">Next follow-up</p>
              <FollowUpBadge date={candidate.nextFollowUp} />
            </div>
            <form onSubmit={logFollowUp} className="space-y-2">
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
                placeholder="What happened? e.g. Called back, confirmed interest."
                className="w-full rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron" />
              <div className="flex items-center gap-2">
                <input type="date" value={nextDate || ''} onChange={e => setNextDate(e.target.value)}
                  className="flex-1 rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron" />
                <button type="submit" disabled={savingNote || !note.trim()}
                  className="rounded-lg bg-saffron px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  Log it
                </button>
              </div>
            </form>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">History</p>
            {history.length === 0 ? (
              <p className="text-sm text-slate">No follow-ups logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {history.map(h => (
                  <li key={h.id} className="relative pl-4">
                    <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-saffron" />
                    <p className="text-sm text-ink-800">{h.note}</p>
                    <p className="mt-0.5 text-xs text-slate">
                      {formatDateFull(h.date)}{h.nextFollowUp && <> · next: {formatDateFull(h.nextFollowUp)}</>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {/* ── Calls tab ── */}
      {tab === 'calls' && (
        <>
          <div className="mt-4 rounded-xl border border-ink-100 bg-paper p-3.5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate">Log a call</p>
            <form onSubmit={logCall} className="space-y-2">
              <textarea value={callNote} onChange={e => setCallNote(e.target.value)} rows={2}
                placeholder="What was discussed?"
                className="w-full rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron" />
              <div className="flex gap-2">
                <select value={callOutcome} onChange={e => setCallOutcome(e.target.value)}
                  className="flex-1 rounded-lg border border-ink-100 bg-paper-card px-3 py-2 text-sm outline-none focus:border-saffron">
                  {OUTCOMES.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}
                </select>
                <button type="submit" disabled={savingCall || !callNote.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-ink-800 px-4 py-2 text-sm font-semibold text-paper disabled:opacity-50">
                  <PhoneCall size={14} /> Save
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4">
            {candCallLogs.length === 0 ? (
              <p className="text-sm text-slate">No calls logged yet.</p>
            ) : (
              <ul className="space-y-3">
                {candCallLogs.map(l => {
                  const outcome = OUTCOMES.find(o => o.key === l.outcome)
                  return (
                    <li key={l.id} className="relative pl-4">
                      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-ink-400" />
                      <p className="text-sm text-ink-800">{l.note}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate">
                        <span>{formatDateFull(l.date)}</span>
                        {l.hr && <span>· {l.hr}</span>}
                        {outcome && <span className={outcome.color}>{outcome.label}</span>}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </>
      )}

      <div className="perforated mt-6" />
      <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
        <span>Added {timeAgo(candidate.createdAt)}</span>
        <button onClick={() => setConfirmDelete(true)}
          className="flex items-center gap-1 font-semibold text-rust hover:text-rust-600">
          <Trash2 size={14} /> Remove
        </button>
      </div>

      <ConfirmDialog open={confirmDelete} title="Remove this candidate?"
        message={`${candidate.name} will be permanently removed from the pipeline.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => { deleteCandidate(candidate.id); setConfirmDelete(false); closeCandidate() }} />
    </Sheet>
  )
}
