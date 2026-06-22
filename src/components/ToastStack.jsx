import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { useApp } from '../store/AppContext'

export default function ToastStack() {
  const { toasts } = useApp()
  if (!toasts.length) return null
  return (
    <div className="pointer-events-none fixed bottom-20 left-0 right-0 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto flex items-center gap-2 rounded-full bg-ink-800 px-4 py-2.5 text-sm font-medium text-paper shadow-pop"
        >
          {t.tone === 'success' && <CheckCircle2 size={16} className="text-stamp" />}
          {t.tone === 'error' && <XCircle size={16} className="text-rust" />}
          {t.tone === 'default' && <Info size={16} className="text-saffron" />}
          {t.message}
        </div>
      ))}
    </div>
  )
}
