import { AlertTriangle, X } from 'lucide-react'
import { sourceMeta } from '../../lib/constants'

const PALETTE = ['#16213E', '#C9801B', '#246340', '#9E332B', '#5A6896', '#9C6314']

export function SourceBadge({ source, size = 'sm', className = '' }) {
  if (!source) return null
  const meta = sourceMeta(source)
  const pad = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
  return (
    <span
      title={source}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border font-semibold leading-none ${pad} ${meta.badge} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {source}
    </span>
  )
}

export function Avatar({ name, size = 40 }) {
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?'
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = (hash * 31 + name.charCodeAt(i)) % PALETTE.length
  const bg = PALETTE[Math.abs(hash) % PALETTE.length]
  return (
    <div
      className="flex items-center justify-center rounded-full font-display font-semibold text-white shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  )
}

export function Stamp({ children, tone = 'stamp', className = '' }) {
  const tones = {
    stamp: 'border-stamp text-stamp-600',
    rust: 'border-rust text-rust-600',
    saffron: 'border-saffron text-saffron-700',
    ink: 'border-ink-400 text-ink-600'
  }
  return (
    <span
      className={`stamp-rotate inline-flex items-center gap-1 rounded-full border-2 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${tones[tone]} ${className}`}
      style={{ borderStyle: 'dashed' }}
    >
      {children}
    </span>
  )
}

export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-50 text-ink-400">
          <Icon size={26} strokeWidth={1.6} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-slate">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl2 border border-ink-100 bg-paper-card p-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-ink-50" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 rounded bg-ink-50" />
          <div className="h-3 w-1/3 rounded bg-ink-50" />
        </div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Remove', tone = 'rust', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-900/40 p-4" onClick={onCancel}>
      <div
        className="animate-pop-in w-full max-w-sm rounded-xl2 bg-paper-card p-5 shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone === 'rust' ? 'bg-rust-50 text-rust-600' : 'bg-saffron-50 text-saffron-700'}`}>
            <AlertTriangle size={18} />
          </div>
          <div>
            <h4 className="font-display text-base font-semibold text-ink-800">{title}</h4>
            <p className="mt-1 text-sm text-slate">{message}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-medium text-slate hover:bg-ink-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${tone === 'rust' ? 'bg-rust hover:bg-rust-600' : 'bg-saffron hover:bg-saffron-600'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sheet({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-900/40" />
      <div
        className="animate-slide-up sm:animate-pop-in relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-paper-card shadow-pop sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-100 bg-paper-card px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-ink-800">{title}</h3>
          <button onClick={onClose} className="rounded-full p-1.5 text-slate hover:bg-ink-50">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
