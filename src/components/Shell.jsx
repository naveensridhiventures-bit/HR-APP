import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, CalendarClock, LayoutGrid, Plus, Radar, Search, Settings, Users } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useUi } from '../store/UiContext'
import { Avatar } from './ui/Primitives'
import { InstallButton } from './InstallPrompt'

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard', mobileLabel: 'Home',      icon: LayoutGrid, end: true },
  { to: '/pipeline',    label: 'Pipelines', mobileLabel: 'Pipeline',  icon: Users },
  { to: '/followups',   label: 'Follow-ups',mobileLabel: 'Follow-ups',icon: CalendarClock },
  { to: '/candidates',  label: 'Candidates',mobileLabel: 'All',       icon: Search },
  { to: '/sources',     label: 'Lead Sources', mobileLabel: 'Sources',icon: Radar },
  { to: '/performance', label: 'HR Performance', mobileLabel: 'Stats',icon: BarChart2 },
  { to: '/settings',    label: 'Settings',  mobileLabel: 'Settings',  icon: Settings },
]

function NavItem({ to, label, mobileLabel, icon: Icon, end, mobile }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        mobile
          ? `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium ${isActive ? 'text-saffron-700' : 'text-slate'}`
          : `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              isActive ? 'bg-ink-700 text-paper' : 'text-ink-100/80 hover:bg-ink-700/60 hover:text-paper'
            }`
      }
    >
      <Icon size={mobile ? 20 : 17} strokeWidth={1.8} />
      <span className={mobile ? 'truncate w-full text-center' : ''}>{mobile ? (mobileLabel || label) : label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  const { companyName } = useApp()
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-ink-800 px-4 py-6 lg:flex">
      <div className="mb-8 flex items-center gap-2.5 px-1.5">
        <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-xl" onError={e => { e.target.style.display='none' }} />
        <div>
          <p className="font-display text-base font-semibold leading-tight text-paper">{companyName}</p>
          <p className="text-[11px] text-ink-100/60">Hiring pipeline</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>
      <div className="mt-auto px-1 pt-4">
        <InstallButton className="w-full justify-center" />
      </div>
    </aside>
  )
}

export function BottomNav() {
  const mobileItems = [
    { to: '/',            label: 'Dashboard', mobileLabel: 'Home',      icon: LayoutGrid, end: true },
    { to: '/pipeline',    label: 'Pipelines', mobileLabel: 'Pipeline',  icon: Users },
    { to: '/followups',   label: 'Follow-ups',mobileLabel: 'Follow-ups',icon: CalendarClock },
    { to: '/sources',     label: 'Lead Sources', mobileLabel: 'Sources',icon: Radar },
    { to: '/settings',    label: 'Settings',  mobileLabel: 'Settings',  icon: Settings },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-ink-100 bg-paper-card/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {mobileItems.map((item) => <NavItem key={item.to} {...item} mobile />)}
    </nav>
  )
}

export function Fab() {
  const { openAddModal } = useUi()
  return (
    <button onClick={() => openAddModal()} aria-label="Add candidate"
      className="fixed bottom-[4.5rem] right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-saffron text-white shadow-pop active:scale-95 lg:hidden">
      <Plus size={26} />
    </button>
  )
}

export function TopBar({ title, subtitle }) {
  const { candidates } = useApp()
  const { openCandidate, openAddModal } = useUi()
  const [query, setQuery] = useState('')

  const results = query.trim()
    ? candidates.filter((c) =>
        c.name?.toLowerCase().includes(query.toLowerCase()) || c.phone?.includes(query)
      ).slice(0, 6)
    : []

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-paper/90 px-4 py-3.5 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="font-display text-xl font-semibold text-ink-800 sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate">{subtitle}</p>}
        </div>
        <div className="relative hidden sm:block">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            onBlur={() => setTimeout(() => setQuery(''), 200)}
            placeholder="Search name or phone…"
            className="w-60 rounded-lg border border-ink-100 bg-paper-card py-2 pl-9 pr-3 text-sm outline-none focus:border-saffron" />
          {results.length > 0 && (
            <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-ink-100 bg-paper-card shadow-pop">
              {results.map((c) => (
                <button key={c.id} onMouseDown={() => { openCandidate(c.id); setQuery('') }}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm hover:bg-ink-50">
                  <Avatar name={c.name} size={28} />
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="font-mono-data text-xs text-slate">{c.phone}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => openAddModal()}
          className="hidden items-center gap-1.5 rounded-lg bg-ink-800 px-4 py-2 text-sm font-semibold text-paper hover:bg-ink-700 sm:flex">
          <Plus size={16} /> Add candidate
        </button>
      </div>
    </header>
  )
}