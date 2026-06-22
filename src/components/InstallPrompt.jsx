import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'

const DISMISS_KEY = 'sridhi-hr:install-dismissed-until'

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null)
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault()
      setDeferredEvent(e)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredEvent(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredEvent) return false
    deferredEvent.prompt()
    const { outcome } = await deferredEvent.userChoice
    setDeferredEvent(null)
    return outcome === 'accepted'
  }

  return { canInstall: Boolean(deferredEvent) && !installed, installed, promptInstall, isIos: isIos() && !installed }
}

export function InstallButton({ className = '' }) {
  const { canInstall, installed, promptInstall, isIos } = useInstallPrompt()
  const [showIosTip, setShowIosTip] = useState(false)

  if (installed) return null
  if (!canInstall && !isIos) return null

  return (
    <>
      <button
        onClick={() => (canInstall ? promptInstall() : setShowIosTip(true))}
        className={`inline-flex items-center gap-1.5 rounded-lg bg-saffron px-3 py-2 text-sm font-semibold text-white shadow-card hover:bg-saffron-600 ${className}`}
      >
        <Download size={15} /> Install app
      </button>
      {showIosTip && <IosTipSheet onClose={() => setShowIosTip(false)} />}
    </>
  )
}

function IosTipSheet({ onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-ink-900/40 sm:items-center" onClick={onClose}>
      <div
        className="animate-slide-up sm:animate-pop-in w-full max-w-sm rounded-t-2xl bg-paper-card p-5 shadow-pop sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-display text-base font-semibold text-ink-800">Add Sridhi HR to your Home Screen</h4>
          <button onClick={onClose} className="rounded-full p-1 text-slate hover:bg-ink-50"><X size={18} /></button>
        </div>
        <ol className="mt-4 space-y-3 text-sm text-ink-700">
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 font-mono-data text-xs">1</span>
            Tap the <Share size={15} className="inline -mt-0.5 text-saffron" /> Share icon in Safari's toolbar
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 font-mono-data text-xs">2</span>
            Scroll down and tap <SquarePlus size={15} className="inline -mt-0.5 text-saffron" /> "Add to Home Screen"
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-50 font-mono-data text-xs">3</span>
            Tap "Add" — the Sridhi HR icon appears on your home screen
          </li>
        </ol>
      </div>
    </div>
  )
}

export default function InstallBanner() {
  const { canInstall, installed, promptInstall, isIos } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(true)
  const [showIosTip, setShowIosTip] = useState(false)

  useEffect(() => {
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0)
    setDismissed(Date.now() < until)
  }, [])

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 1000 * 60 * 60 * 24 * 7))
    setDismissed(true)
  }

  if (installed || dismissed || (!canInstall && !isIos)) return null

  return (
    <div className="animate-pop-in fixed inset-x-3 bottom-20 z-[55] sm:bottom-5 sm:left-auto sm:right-5 sm:w-80">
      <div className="flex items-start gap-3 rounded-xl2 border border-ink-100 bg-ink-800 p-4 text-paper shadow-pop">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-saffron/20 text-saffron">
          <Download size={18} />
        </div>
        <div className="flex-1">
          <p className="font-display text-sm font-semibold">Install Sridhi HR</p>
          <p className="mt-0.5 text-xs text-ink-100">One tap from your home screen — works offline, no browser bar.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => (canInstall ? promptInstall() : setShowIosTip(true))}
              className="rounded-lg bg-saffron px-3 py-1.5 text-xs font-semibold text-ink-900"
            >
              Install now
            </button>
            <button onClick={dismiss} className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-100 hover:bg-white/5">
              Not now
            </button>
          </div>
        </div>
        <button onClick={dismiss} className="text-ink-100 hover:text-white"><X size={16} /></button>
      </div>
      {showIosTip && <IosTipSheet onClose={() => setShowIosTip(false)} />}
    </div>
  )
}
