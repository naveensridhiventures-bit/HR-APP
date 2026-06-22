import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import { waLink } from '../lib/contact'
import { getRecommendedTemplates, getAllTemplates, renderTemplate } from '../lib/messageTemplates'
import { useApp } from '../store/AppContext'

// Drop-in replacement for the old "single hardcoded WhatsApp link" button.
// Click opens a small popover: recommended templates for this candidate's
// current stage first, then every other template below. Picking one opens
// WhatsApp with the message already filled in — nothing is sent
// automatically, the recruiter still taps Send themselves.
//
// variant="icon" (default) renders a small round icon button, matching the
// old behaviour on cards/rows. variant="button" renders a full-width
// labeled button, for the candidate drawer's action row.
export default function WhatsAppMenu({ candidate, deptLabel, size = 14, className = '', variant = 'icon' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const { departments, roles, companyName } = useApp()

  useEffect(() => {
    if (!open) return
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const recommended = getRecommendedTemplates(candidate.stage)
  const recommendedIds = new Set(recommended.map((t) => t.id))
  const others = getAllTemplates().filter((t) => !recommendedIds.has(t.id))

  const context = { departments, roles, candidates: [], companyName }

  const openTemplate = (template) => {
    const text = renderTemplate(template, candidate, deptLabel, context)
    window.open(waLink(candidate.phone, text), '_blank', 'noreferrer')
    setOpen(false)
  }

  return (
    <div ref={ref} className={`relative inline-block ${variant === 'button' ? 'flex-1' : ''}`}>
      {variant === 'button' ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border border-stamp/30 bg-stamp-50 py-2 text-sm font-semibold text-stamp-600 hover:bg-stamp-50/70 ${className}`}
        >
          <MessageCircle size={15} /> WhatsApp
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
          aria-label="WhatsApp message"
          className={`rounded-full p-1.5 text-stamp hover:bg-stamp-50 ${className}`}
        >
          <MessageCircle size={size} />
        </button>
      )}

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 mt-1.5 w-72 max-h-80 overflow-y-auto rounded-xl2 border border-ink-100 bg-paper-card p-2 shadow-pop ${variant === 'button' ? 'left-0' : 'right-0'}`}
        >
          {recommended.length > 0 && (
            <>
              <p className="flex items-center gap-1 px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-saffron-700">
                <Sparkles size={11} /> Suggested for this stage
              </p>
              {recommended.map((t) => (
                <TemplateItem key={t.id} template={t} onClick={() => openTemplate(t)} />
              ))}
              <div className="my-1.5 border-t border-ink-100" />
            </>
          )}
          <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate">
            All templates
          </p>
          {others.map((t) => (
            <TemplateItem key={t.id} template={t} onClick={() => openTemplate(t)} />
          ))}
        </div>
      )}
    </div>
  )
}

function TemplateItem({ template, onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-ink-700 hover:bg-ink-50"
    >
      {template.label}
    </button>
  )
}
